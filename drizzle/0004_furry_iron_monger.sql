CREATE TABLE `flow_states` (
	`id` text PRIMARY KEY NOT NULL,
	`flow_key` text NOT NULL,
	`lead_id` text,
	`current_step_index` integer DEFAULT 0 NOT NULL,
	`completed_steps` text DEFAULT '[]' NOT NULL,
	`step_states` text DEFAULT '{}',
	`status` text DEFAULT 'running' NOT NULL,
	`started_at` integer NOT NULL,
	`paused_at` integer,
	`resumed_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `flow_states_status_idx` ON `flow_states` (`status`);--> statement-breakpoint
CREATE INDEX `flow_states_flow_key_idx` ON `flow_states` (`flow_key`);--> statement-breakpoint
CREATE INDEX `flow_states_lead_id_idx` ON `flow_states` (`lead_id`);