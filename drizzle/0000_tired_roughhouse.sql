CREATE TABLE `culture_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`context` text NOT NULL,
	`audience_json` text DEFAULT '[]' NOT NULL,
	`relationship_json` text DEFAULT '[]' NOT NULL,
	`shared_human_truth` text NOT NULL,
	`emotions_json` text DEFAULT '[]' NOT NULL,
	`mechanisms_json` text DEFAULT '[]' NOT NULL,
	`source_kind` text DEFAULT 'original' NOT NULL,
	`stale_after` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_culture_cards_status_stale` ON `culture_cards` (`status`,`stale_after`);--> statement-breakpoint
CREATE TABLE `feedback_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`joke_id` text NOT NULL,
	`vote` text NOT NULL,
	`reason_code` text,
	`dwell_ms` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_feedback_session_time` ON `feedback_events` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_feedback_joke_vote` ON `feedback_events` (`joke_id`,`vote`);--> statement-breakpoint
CREATE INDEX `idx_feedback_reason` ON `feedback_events` (`reason_code`);--> statement-breakpoint
CREATE TABLE `generation_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`scene` text NOT NULL,
	`audience` text NOT NULL,
	`tone` text NOT NULL,
	`provider` text NOT NULL,
	`model` text,
	`prompt_version` text NOT NULL,
	`status` text NOT NULL,
	`candidate_count` integer DEFAULT 0 NOT NULL,
	`accepted_count` integer DEFAULT 0 NOT NULL,
	`duration_ms` integer,
	`trace_json` text DEFAULT '{}' NOT NULL,
	`error_code` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_generation_session_time` ON `generation_runs` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_generation_status` ON `generation_runs` (`status`);--> statement-breakpoint
CREATE TABLE `impression_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`joke_id` text NOT NULL,
	`surface` text DEFAULT 'feed' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`served_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_impressions_session_time` ON `impression_events` (`session_id`,`served_at`);--> statement-breakpoint
CREATE INDEX `idx_impressions_joke` ON `impression_events` (`joke_id`);--> statement-breakpoint
CREATE TABLE `joke_candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`setup_json` text NOT NULL,
	`punchline` text NOT NULL,
	`tag` text,
	`emoji` text DEFAULT '🙂' NOT NULL,
	`mechanism_id` text NOT NULL,
	`format` text NOT NULL,
	`topics_json` text DEFAULT '[]' NOT NULL,
	`emotional_truth` text NOT NULL,
	`expected_reading` text NOT NULL,
	`revealed_reading` text NOT NULL,
	`palette` text DEFAULT 'yellow' NOT NULL,
	`label` text NOT NULL,
	`quality_score` integer NOT NULL,
	`quality_json` text NOT NULL,
	`fingerprint` text NOT NULL,
	`source` text DEFAULT 'baseline' NOT NULL,
	`provider` text DEFAULT 'deterministic' NOT NULL,
	`model` text,
	`prompt_version` text DEFAULT 'baseline-v1' NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`visibility_session_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_joke_candidates_status_quality` ON `joke_candidates` (`status`,`quality_score`);--> statement-breakpoint
CREATE INDEX `idx_joke_candidates_visibility` ON `joke_candidates` (`visibility_session_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_joke_candidates_mechanism` ON `joke_candidates` (`mechanism_id`);--> statement-breakpoint
CREATE TABLE `pairwise_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`joke_a_id` text NOT NULL,
	`joke_b_id` text NOT NULL,
	`winner_id` text NOT NULL,
	`reason_code` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_pairwise_session_time` ON `pairwise_events` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_pairwise_winner` ON `pairwise_events` (`winner_id`);--> statement-breakpoint
CREATE TABLE `runtime_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`value` real NOT NULL,
	`dimensions_json` text DEFAULT '{}' NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_runtime_metrics_name_time` ON `runtime_metrics` (`name`,`recorded_at`);