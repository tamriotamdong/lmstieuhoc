-- CREATE DATABASE IF NOT EXISTS computer_science_lms DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE computer_science_lms;

-- 1. Table users (He thong nguoi dung dung chung: admin, teacher, student)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table classes (Khoi - Lop hoc)
CREATE TABLE `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `grade` INT NOT NULL, -- Khối: 3, 4, 5
  `class_name` VARCHAR(50) NOT NULL, -- Tên lớp: 3.1, 3.2, 4.1, 5.1 ...
  `school_year` VARCHAR(20) DEFAULT '2025-2026',
  CONSTRAINT UNIQUE_class UNIQUE (`grade`, `class_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table students (Thong tin chi tiet hoc sinh)
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `fullname` VARCHAR(100) NOT NULL,
  `school` VARCHAR(150) NOT NULL,
  `avatar` VARCHAR(50) DEFAULT '😀', -- Emoji hoac path avatar
  `class_id` INT,
  `xp` INT DEFAULT 0,
  `level` INT DEFAULT 1,
  `streak` INT DEFAULT 0,
  `last_study_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table teachers (Thong tin chi tiet giao vien)
CREATE TABLE `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `fullname` VARCHAR(100) NOT NULL,
  `school` VARCHAR(150) NOT NULL,
  `avatar` VARCHAR(50) DEFAULT '💼',
  `subject` VARCHAR(100) DEFAULT 'Tin học', -- Tin học, Giáo viên chủ nhiệm, Âm nhạc,...
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table lessons (Bai hoc)
CREATE TABLE `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `program_type` VARCHAR(100) NOT NULL DEFAULT 'Kết nối tri thức với cuộc sống',
  `grade` INT NOT NULL, -- Lớp 3, 4, 5
  `module_name` VARCHAR(100) DEFAULT NULL, -- Dùng cho IC3 Spark (Vd: Máy tính căn bản)
  `topic_name` VARCHAR(150) NOT NULL, -- Chủ đề (Vd: Chủ đề 1. Máy tính và em)
  `lesson_number` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL, -- Tên bài học (Vd: Bài 1: Thông tin và quyết định)
  `short_description` TEXT,
  `video_url` VARCHAR(255) DEFAULT '', -- link video bài giảng
  `pdf_url` VARCHAR(255) DEFAULT '', -- link tài liệu pdf
  `infographic_url` VARCHAR(255) DEFAULT '', -- link infographic tóm tắt
  `illustration_url` VARCHAR(255) DEFAULT '', -- hình ảnh minh họa
  `color_theme` VARCHAR(50) DEFAULT 'pastel-pink', -- pastel-pink, pastel-blue,...
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table exercises (Bai tap duoi moi bai hoc)
CREATE TABLE `exercises` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `xp_reward` INT DEFAULT 20,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table questions (Ngan hang cau hoi de lam mini-game/trac nghiem)
CREATE TABLE `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exercise_id` INT DEFAULT NULL, -- Có thể thuộc về bài tập cố định hoặc chung ngân hàng đề
  `lesson_id` INT DEFAULT NULL, -- Liên kết trực tiếp tới bài học
  `game_type` ENUM('quiz', 'true_false', 'gap_fill', 'matching', 'memory') NOT NULL DEFAULT 'quiz',
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(255) DEFAULT NULL,
  `option_b` VARCHAR(255) DEFAULT NULL,
  `option_c` VARCHAR(255) DEFAULT NULL,
  `option_d` VARCHAR(255) DEFAULT NULL,
  `correct_answer` TEXT NOT NULL, -- quiz: A/B/C/D, true_false: True/False, gap_fill: từ khóa, matching/memory: JSON cặp nối
  `explanation` TEXT DEFAULT NULL,
  FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table results (Ket qua lam bai, hoc bai cua hoc sinh de tinh diem, tien do)
CREATE TABLE `results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `score_pct` INT DEFAULT 0, -- Phần trăm tiến độ hoặc điểm (90%, 100%)
  `xp_earned` INT DEFAULT 0,
  `status` ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
  `last_accessed` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE,
  CONSTRAINT UNIQUE_student_lesson UNIQUE (`student_id`, `lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table badges (Huy hieu he thong)
CREATE TABLE `badges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL, -- nha_tin_hoc_nhi, chuyen_gia_ban_phim, sieu_sao_cntt
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `icon_emoji` VARCHAR(20) NOT NULL DEFAULT '🏅',
  `xp_required` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table student_badges (Lien ket hoc sinh da dat huy hieu nao)
CREATE TABLE `student_badges` (
  `student_id` INT NOT NULL,
  `badge_id` INT NOT NULL,
  `awarded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`, `badge_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table rankings (Bang xep hang ghi nhan de giao dien truy van nhanh)
CREATE TABLE `rankings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `rank_type` ENUM('class', 'grade', 'school') NOT NULL DEFAULT 'school',
  `period` VARCHAR(20) DEFAULT 'all_time', -- weekly, monthly, all_time
  `rank_position` INT NOT NULL,
  `total_xp` INT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- INSERT SAMPLE SEED DATA

-- Insert default badges
INSERT INTO `badges` (`code`, `title`, `description`, `icon_emoji`, `xp_required`) VALUES
('nha_tin_hoc_nhi', '🥉 Nhà Tin học nhí', 'Nhận được khi tích lũy từ 100 XP học tập', '🥉', 100),
('chuyen_gia_ban_phim', '🥈 Chuyên gia Tin học', 'Nhận được khi đạt cấp độ 5 và hoàn thành 10 bài tập', '🥈', 500),
('sieu_sao_cntt', '🥇 Siêu sao CNTT', 'Nhận được khi xuất sắc vượt qua các game và đạt 1200 XP', '🥇', 1200);

-- Insert default classes
INSERT INTO `classes` (`grade`, `class_name`, `school_year`) VALUES
(3, '3.1', '2025-2026'),
(3, '3.2', '2025-2026'),
(3, '3.3', '2025-2026'),
(4, '4.1', '2025-2026'),
(4, '4.2', '2025-2026'),
(5, '5.1', '2025-2026'),
(5, '5.2', '2025-2026');

-- Insert default lessons for GDPT 2018 (Grade 3)
INSERT INTO `lessons` (`program_type`, `grade`, `topic_name`, `lesson_number`, `title`, `short_description`, `video_url`, `pdf_url`, `infographic_url`, `color_theme`) VALUES
('GDPT2018', 3, 'Chủ đề 1. Máy tính và em', 1, 'Bài 1: Thông tin và quyết định', 'Học sinh nhận biết được thông tin xung quanh và đưa ra các quyết định phù hợp.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '#pdf-doc-1', '#infographic-1', 'pastel-pink'),
('GDPT2018', 3, 'Chủ đề 1. Máy tính và em', 2, 'Bài 2: Xử lý thông tin', 'Tìm hiểu cách bộ não con người tiếp nhận và xử lý thông tin như thế nào.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '#pdf-doc-2', '#infographic-2', 'pastel-blue'),
('GDPT2018', 3, 'Chủ đề 1. Máy tính và em', 3, 'Bài 3: Máy tính và em', 'Làm quen các bộ phận cơ bản của máy tính: Chuột, bàn phím, màn hình, thân máy.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '#pdf-doc-3', '#infographic-3', 'pastel-yellow');

-- Insert default Admin credentials
-- Mật khẩu mặc định: admin123 (trong ứng dụng thực tế sẽ hash bằng bcrypt)
INSERT INTO `users` (`username`, `password_hash`, `role`) VALUES
('admin', '$2b$10$yqI5MvE6FSmq3Ww/S/dZveY89Hq6y7uIeGk6uB/l2fABy.62e21jS', 'admin'),
('teacher1', '$2b$10$yqI5MvE6FSmq3Ww/S/dZveY89Hq6y7uIeGk6uB/l2fABy.62e21jS', 'teacher'),
('hocsinh', '$2b$10$yqI5MvE6FSmq3Ww/S/dZveY89Hq6y7uIeGk6uB/l2fABy.62e21jS', 'student');
