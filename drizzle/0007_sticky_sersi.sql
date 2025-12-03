CREATE TABLE `product_automation_settings` (
	`flow_key` text PRIMARY KEY NOT NULL,
	`headless` integer DEFAULT true NOT NULL,
	`stop_at_step` text,
	`updated_at` integer NOT NULL
);
