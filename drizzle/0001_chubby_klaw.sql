CREATE TABLE `auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`revoked_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_auth_sessions_user` ON `auth_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_auth_sessions_expiry` ON `auth_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `wechat_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`openid_hash` text NOT NULL,
	`unionid_hash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wechat_accounts_openid_hash_unique` ON `wechat_accounts` (`openid_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `wechat_accounts_unionid_hash_unique` ON `wechat_accounts` (`unionid_hash`);--> statement-breakpoint
CREATE INDEX `idx_wechat_accounts_unionid` ON `wechat_accounts` (`unionid_hash`);