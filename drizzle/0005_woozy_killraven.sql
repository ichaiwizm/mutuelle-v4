PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flow_states` (
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
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`flow_key`) REFERENCES `flows`(`key`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_flow_states`("id", "flow_key", "lead_id", "current_step_index", "completed_steps", "step_states", "status", "started_at", "paused_at", "resumed_at", "completed_at", "created_at", "updated_at") SELECT "id", "flow_key", "lead_id", "current_step_index", "completed_steps", "step_states", "status", "started_at", "paused_at", "resumed_at", "completed_at", "created_at", "updated_at" FROM `flow_states`;--> statement-breakpoint
DROP TABLE `flow_states`;--> statement-breakpoint
ALTER TABLE `__new_flow_states` RENAME TO `flow_states`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `flow_states_status_idx` ON `flow_states` (`status`);--> statement-breakpoint
CREATE INDEX `flow_states_flow_key_idx` ON `flow_states` (`flow_key`);--> statement-breakpoint
CREATE INDEX `flow_states_lead_id_idx` ON `flow_states` (`lead_id`);--> statement-breakpoint
CREATE TABLE `__new_run_items` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`flow_key` text NOT NULL,
	`lead_id` text NOT NULL,
	`status` text NOT NULL,
	`artifacts_dir` text NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flow_key`) REFERENCES `flows`(`key`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_run_items`("id", "run_id", "flow_key", "lead_id", "status", "artifacts_dir") SELECT "id", "run_id", "flow_key", "lead_id", "status", "artifacts_dir" FROM `run_items`;--> statement-breakpoint
DROP TABLE `run_items`;--> statement-breakpoint
ALTER TABLE `__new_run_items` RENAME TO `run_items`;