-- ============================================================
-- Tabela de notícias
CREATE TABLE IF NOT EXISTS `skyx_noticias` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(180) NOT NULL UNIQUE,
    `resumo` VARCHAR(255) DEFAULT NULL,
    `conteudo_html` TEXT NOT NULL,
    `capa_url` VARCHAR(255) DEFAULT NULL,
    `imagens_json` TEXT DEFAULT NULL,
    `tags` VARCHAR(255) DEFAULT NULL,
    `destaque` ENUM('none','destaque1','destaque2','destaque3') NOT NULL DEFAULT 'none',
    `status` ENUM('publicada','arquivada') NOT NULL DEFAULT 'publicada',
    `data_publicacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================================
-- schema.sql — Estrutura do banco de dados SKY X Dashboard
-- Execute este arquivo no phpMyAdmin da LocalWeb
-- ============================================================

USE `wp_63987767156`;

-- Tabela de usuários do dashboard
CREATE TABLE IF NOT EXISTS `skyx_users` (
    `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `username`      VARCHAR(50)      NOT NULL UNIQUE,
    `email`         VARCHAR(150)     NOT NULL UNIQUE,
    `password_hash` VARCHAR(255)     NOT NULL,
    `role`          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
    `name`          VARCHAR(100)     NOT NULL,
    `active`        TINYINT(1)       NOT NULL DEFAULT 1,
    `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_login`    DATETIME                  DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabela de sessões/tokens de autenticação
CREATE TABLE IF NOT EXISTS `skyx_sessions` (
    `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`       INT UNSIGNED     NOT NULL,
    `token`         VARCHAR(64)      NOT NULL UNIQUE,
    `expires_at`    DATETIME         NOT NULL,
    `ip_address`    VARCHAR(45)               DEFAULT NULL,
    `user_agent`    VARCHAR(255)              DEFAULT NULL,
    `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_token` (`token`),
    INDEX `idx_user_id` (`user_id`),
    CONSTRAINT `fk_sessions_user`
        FOREIGN KEY (`user_id`) REFERENCES `skyx_users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- Tabela de mensagens de contato
CREATE TABLE IF NOT EXISTS `skyx_mensagens` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(30) DEFAULT NULL,
    `assunto` VARCHAR(100) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `status` ENUM('unread','answered','archived') NOT NULL DEFAULT 'unread',
    `data` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- Usuário admin inicial
-- Senha: skyx2026 (hash bcrypt)
-- TROQUE A SENHA APÓS O PRIMEIRO LOGIN!
-- Para gerar novo hash: https://bcrypt-generator.com/ (cost 12)
-- ============================================================
INSERT INTO `skyx_users` (`username`, `email`, `password_hash`, `role`, `name`)
VALUES (
    'admin',
    'admin@skyx.com.br',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: skyx2026
    'admin',
    'Admin SkyX'
);

-- Tabela para armazenar imagens em BLOB
CREATE TABLE IF NOT EXISTS `skyx_imagens` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(100) NOT NULL,
    `dados` LONGBLOB NOT NULL,
    `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
