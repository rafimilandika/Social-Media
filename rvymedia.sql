-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 07, 2025 at 05:32 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rvymedia`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`, `created_at`) VALUES
(1, 4, 4, 'ini komentar 3', '2025-06-26 04:32:19'),
(2, 4, 4, 'ini komentar ke 4 di postingan bima', '2025-06-26 04:33:10'),
(3, 3, 6, 'ini komentar bima ke postingan rudi', '2025-06-26 04:42:10'),
(4, 7, 4, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '2025-06-29 06:44:36'),
(5, 7, 4, 'ini nyoba komen di post saya', '2025-06-30 08:22:34'),
(6, 8, 7, 'ini komentar agus', '2025-07-01 04:50:40'),
(7, 7, 7, 'ikut komentar', '2025-07-01 05:26:50'),
(8, 10, 7, 'ini komen AGUS', '2025-07-01 05:29:28'),
(9, 10, 7, 'ini komentar 2', '2025-07-01 05:32:20'),
(10, 9, 4, 'ini komen postingan Agus dari Rudi yang dilihat dari lihat profil agus', '2025-07-05 05:34:58');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `content`, `image_url`, `created_at`) VALUES
(3, 4, 'ini post ke 3', NULL, '2025-06-23 15:19:42'),
(4, 6, 'ini postingan bima', NULL, '2025-06-25 02:36:08'),
(6, 4, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', NULL, '2025-06-29 06:05:03'),
(7, 4, 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', NULL, '2025-06-29 06:15:45'),
(8, 4, 'ini ide saya post ke 5', NULL, '2025-06-30 08:28:39'),
(9, 7, 'ini postingan agsu untuk mengecek PP', NULL, '2025-07-01 04:42:37'),
(10, 4, 'ini postingan RUDIIII', NULL, '2025-07-01 04:45:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo_profile` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `photo_profile`, `created_at`) VALUES
(1, 'rafi', 'rafimlandika@gmai.com', '123', NULL, '2025-06-14 10:39:45'),
(2, 'yanto', 'yuwandarafi@gmail.com', '123', NULL, '2025-06-15 02:22:37'),
(3, 'cika', 'cika@gmail.com', '123', NULL, '2025-06-15 02:53:32'),
(4, 'rudi', 'rudi@gmail.com', '$2b$10$iYCu8vv6cx01y/gswTzYQOzM8O751eskexKutgz16.RbY80nRYYa.', '/uploads/profile_photos/4-1751360079340.jpg', '2025-06-15 03:00:42'),
(6, 'bima', 'bima@gmail.com', '$2b$10$nOvEMQ4Gw6en8H69m93s/OjWCA6Sedc7FrN0S7kNuFgS5cXZPDUxe', NULL, '2025-06-25 02:35:47'),
(7, 'Agus', 'agus@gmail.com', '$2b$10$ASGmxyQo63bjjmrTaN5YfeRFeQg5r/ydBKjMRgF60jbui1YA/nMVS', '/uploads/profile_photos/7-1751362384669.jpg', '2025-07-01 03:56:26'),
(8, 'Lala', 'lala@gmial.com', '$2b$10$3ImcDkl.WXyPXlXfgz7FNuAqpsa12.37qrzlKthZn8k5z0wQ9hCyO', '/user.png', '2025-07-06 09:25:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
