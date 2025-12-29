CREATE TABLE `devis` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`flow_key` text NOT NULL,
	`status` text NOT NULL,
	`data` text,
	`pdf_path` text,
	`error_message` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flow_key`) REFERENCES `flows`(`key`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `devis_lead_id_idx` ON `devis` (`lead_id`);--> statement-breakpoint
CREATE INDEX `devis_flow_key_idx` ON `devis` (`flow_key`);--> statement-breakpoint
CREATE INDEX `devis_status_idx` ON `devis` (`status`);--> statement-breakpoint
ALTER TABLE `product_automation_settings` DROP COLUMN `stop_at_step`;