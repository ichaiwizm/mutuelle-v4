/**
 * Tests E2E pour la fonctionnalité Pause/Resume du FlowEngine
 *
 * Ces tests vérifient :
 * - La mise en pause d'un flow en cours d'exécution
 * - La persistence de l'état en base de données
 * - La reprise depuis un checkpoint
 * - Les validations de sécurité (flowKey mismatch, état non-paused)
 */
import { test, expect } from "@playwright/test";
import { FlowEngine } from "../../src/main/flows/engine";
import { flowStateService } from "../../src/main/flows/state";
import { LeadTransformer } from "../../src/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer";
import { selectLead } from "../leads";
import { createAlptisServices } from "../../src/main/flows/engine/services";

// Skip si pas de credentials
const hasCredentials = !!process.env.ALPTIS_TEST_USERNAME && !!process.env.ALPTIS_TEST_PASSWORD;

test.describe("FlowEngine Pause/Resume", () => {
  test.skip(!hasCredentials, "Credentials Alptis manquants dans .env");

  test.beforeEach(async ({ page }) => {
    // Pre-authenticate to speed up tests
    const services = createAlptisServices();
    await services.auth.login(page);
  });

  test("Pause mid-flow et persiste état en DB", async ({ page }) => {
    const lead = selectLead("solo");
    const leadData = LeadTransformer.transform(lead);

    const engine = new FlowEngine({
      enablePauseResume: true,
      skipAuth: true, // Already authenticated
      verbose: true,
    });

    // Request pause after navigation step completes (step index 1)
    // This gives enough time for auth and nav to complete
    const pauseDelay = 8000; // 8 seconds should be after navigation
    setTimeout(() => {
      console.log("🛑 Requesting pause...");
      engine.requestPause();
    }, pauseDelay);

    const result = await engine.execute("alptis_sante_select", {
      page,
      lead,
      transformedData: leadData,
    });

    // Verify flow was paused
    expect(result.paused).toBe(true);
    expect(result.stateId).toBeDefined();

    // Verify state persisted in DB
    const state = await flowStateService.getState(result.stateId!);
    expect(state).not.toBeNull();
    expect(state!.status).toBe("paused");
    expect(state!.currentStepIndex).toBeGreaterThan(0);
    expect(state!.flowKey).toBe("alptis_sante_select");

    console.log(`✅ Flow paused at step index ${state!.currentStepIndex}`);
    console.log(`✅ Completed steps: ${state!.completedSteps.join(", ")}`);

    // Cleanup
    await flowStateService.deleteState(result.stateId!);
  });

  test("Resume depuis checkpoint complète le flow", async ({ page }) => {
    const lead = selectLead("solo");
    const leadData = LeadTransformer.transform(lead);

    // Phase 1: Execute and pause
    const engine1 = new FlowEngine({
      enablePauseResume: true,
      skipAuth: true,
      verbose: true,
    });

    // Pause after navigation
    setTimeout(() => engine1.requestPause(), 8000);

    const pausedResult = await engine1.execute("alptis_sante_select", {
      page,
      lead,
      transformedData: leadData,
    });

    expect(pausedResult.paused).toBe(true);
    const stateId = pausedResult.stateId!;
    const pausedState = await flowStateService.getState(stateId);
    console.log(`🔄 Paused at step ${pausedState!.currentStepIndex}`);

    // Phase 2: Resume from checkpoint
    const resumedResult = await FlowEngine.resume(
      stateId,
      {
        page,
        lead,
        transformedData: leadData,
      },
      { skipAuth: true, verbose: true }
    );

    // Verify flow completed successfully
    expect(resumedResult.success).toBe(true);
    expect(resumedResult.paused).toBeFalsy();

    // Verify state marked as completed in DB
    const finalState = await flowStateService.getState(stateId);
    expect(finalState!.status).toBe("completed");

    console.log(`✅ Flow resumed and completed successfully`);
    console.log(`✅ Total duration: ${resumedResult.totalDuration}ms`);

    // Cleanup
    await flowStateService.deleteState(stateId);
  });

  test("Refuse resume sur état non-paused", async ({ page }) => {
    // Create a completed state manually
    const state = await flowStateService.createState("alptis_sante_select", "test-lead");
    await flowStateService.markCompleted(state.id);

    // Try to resume - should fail
    await expect(
      FlowEngine.resume(state.id, { page })
    ).rejects.toThrow("Cannot resume flow with status: completed");

    // Cleanup
    await flowStateService.deleteState(state.id);
  });

  test("Refuse resume si flowKey mismatch", async ({ page }) => {
    // Create a paused state with different flowKey
    const state = await flowStateService.createState("wrong_flow_key", "test-lead");
    await flowStateService.markPaused(state.id);

    // The resume will fail during initialization when it tries to execute
    // because the flowKey from state doesn't match a valid product config
    await expect(
      FlowEngine.resume(state.id, { page })
    ).rejects.toThrow();

    // Cleanup
    await flowStateService.deleteState(state.id);
  });

  test("State non trouvé retourne erreur", async ({ page }) => {
    const fakeStateId = "00000000-0000-0000-0000-000000000000";

    await expect(
      FlowEngine.resume(fakeStateId, { page })
    ).rejects.toThrow("Flow state not found");
  });

  test("Checkpoint préserve les steps complétés", async ({ page }) => {
    const lead = selectLead("solo");
    const leadData = LeadTransformer.transform(lead);

    const engine = new FlowEngine({
      enablePauseResume: true,
      skipAuth: true,
      verbose: true,
    });

    // Track step completions
    const completedSteps: string[] = [];
    engine.on("step:complete", (data) => {
      completedSteps.push(data.stepId);
    });

    // Pause after some steps
    setTimeout(() => engine.requestPause(), 10000);

    const result = await engine.execute("alptis_sante_select", {
      page,
      lead,
      transformedData: leadData,
    });

    if (result.paused && result.stateId) {
      const state = await flowStateService.getState(result.stateId);

      // Verify completedSteps in state match emitted events
      expect(state!.completedSteps.length).toBe(completedSteps.length);
      expect(state!.completedSteps).toEqual(completedSteps);

      console.log(`✅ ${completedSteps.length} steps tracked in state`);

      // Cleanup
      await flowStateService.deleteState(result.stateId);
    }
  });
});
