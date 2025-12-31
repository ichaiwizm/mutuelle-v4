CREATE TABLE `flow_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`flow_key` text NOT NULL,
	`platform` text NOT NULL,
	`product` text NOT NULL,
	`version` text NOT NULL,
	`yaml_content` text NOT NULL,
	`checksum` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flow_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`flow_id` text NOT NULL,
	`version` text NOT NULL,
	`yaml_content` text NOT NULL,
	`checksum` text NOT NULL,
	`published_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`flow_id`) REFERENCES `flow_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `flow_definitions_flow_key_idx` ON `flow_definitions` (`flow_key`);
--> statement-breakpoint
CREATE INDEX `flow_definitions_platform_idx` ON `flow_definitions` (`platform`);
--> statement-breakpoint
CREATE INDEX `flow_definitions_status_idx` ON `flow_definitions` (`status`);
--> statement-breakpoint
CREATE UNIQUE INDEX `flow_definitions_flow_key_version_unique` ON `flow_definitions` (`flow_key`, `version`);
--> statement-breakpoint
CREATE INDEX `flow_versions_flow_id_idx` ON `flow_versions` (`flow_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `flow_versions_flow_id_version_unique` ON `flow_versions` (`flow_id`, `version`);
