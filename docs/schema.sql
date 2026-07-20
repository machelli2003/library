-- University Library Management System — MySQL Schema (Phase 1)

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','librarian','admin') NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
  user_id INT PRIMARY KEY,
  student_id VARCHAR(30) UNIQUE,
  program VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  category_id INT,
  quantity INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  description TEXT,
  cover_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE borrow_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  borrow_date DATE,
  due_date DATE,
  return_date DATE,
  status ENUM('pending','approved','rejected','borrowed','returned','overdue') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE fines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_record_id INT NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  status ENUM('unpaid','paid') DEFAULT 'unpaid',
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id) ON DELETE CASCADE
);
