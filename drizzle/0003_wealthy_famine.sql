CREATE TABLE `product_status` (
	`platform` text NOT NULL,
	`product` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text,
	PRIMARY KEY(`platform`, `product`)
);
