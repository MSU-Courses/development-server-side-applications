# Обработка ошибок. Валидация. Логгирование

Обработка ошибок, валидация входных данных и логирование - это три столпа надежного backend приложения.

Представьте, что ваше приложение - это ресторан.

- _Валидация_ - это проверка качества ингредиентов перед готовкой.
- _Обработка ошибок_ - это процедура, которая срабатывает, если что-то пошло не так (горит плита, испортился продукт).
- _Логирование_ - это тетрадь, где повар записывает, что произошло за смену, чтобы потом проанализировать ситуацию.

В этой лекции мы разберемся, как правильно работать с этими компонентами в Node.js.

## Ошибки и исключения в Node.js

В JavaScript и Node.js все исключительные ситуации выражаются через объекты класса `Error`.

В отличие от языков вроде Java или C#, где есть отдельные типы `Exception`, в Node.js все ошибки — это объекты Error или его наследников (`TypeError`, `ReferenceError`, `SyntaxError` и т.д.).

_Исключение (exception)_ — это событие, которое возникает при выполнении кода, когда происходит ошибка.

Когда движок JavaScript встречает проблемную ситуацию, он создаёт объект `Error` и выбрасывает его с помощью оператора throw. Если исключение не перехвачено, процесс завершается с ошибкой.

_Пример выбрасывания и перехвата ошибки:_

```js
try {
  throw new Error("Something went wrong");
} catch (err) {
  console.error(err.message);
}
```

Таким образом, термин _«исключение»_ (exception) описывает сам факт возникновения ошибки, а `Error` — это объект, который хранит информацию об этой ошибке.

## Типы ошибок

В бэкенд-приложениях различают два основных типа ошибок: _операционные ошибки (operational errors)_ и _программные ошибки (programming errors)_ [^9]. Это разделение критично для правильной обработки исключительных ситуаций.

### Операционные ошибки (Operational Errors)

_Операционные ошибки_ - это ожидаемые ошибки, которые могут возникнуть во время нормальной работы приложения. Они не являются багами в коде; это внешние обстоятельства, которые приложение должно предусмотреть и корректно обработать.

_Примеры операционных ошибок_:

- Пользователь не найден в базе данных
- Передан неверный формат электронной почты
- API сервис недоступен или привышен лимит запросов
- Недостаточно средств на счету пользователя

Все эти ситуации - нормальные события, которые приложение должно обработать и вернуть пользователю понятное сообщение об ошибке.

### Программные ошибки (Programming Errors)

_Программные ошибки_ (или _ошибки программиста_) - это баги в коде, которые не должны возникать при правильной реализации. Это логические ошибки, которые можно исправить только изменением исходного кода.

_Примеры программных ошибок_:

- `TypeError: Cannot read property 'name' of undefined` - попытка обратиться к свойству несуществующего объекта
- `ReferenceError: variableName is not defined` - обращение к неопределенной переменной
- `Memory leak` - утечка памяти из-за неправильного управления ресурсами

Когда происходит программная ошибка, приложение может находиться в неконсистентном состоянии. В таких случаях рекомендуется аварийно завершить процесс и перезапустить его, чтобы вернуть систему в стабильное состояние.

### Разделение ошибок на уровне кода

Ошибки можно разделить на уровне кода, используя _собственные классы ошибок_. Это позволяет более точно определять тип ошибки и обрабатывать её соответствующим образом.

_Плохим примером_ является обрабатывать ошибки прям в коде контроллера, например:

```js
async function getUser(req, res) {
  try {
    const user = await User.findById(userId);
    // ... какой-то код
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}
```

Это не позволяет различать типы ошибок и приводит к потере контекста.

## Собственные классы ошибок

Создание собственных классов ошибок позволяет добавить контекст, код ошибки и другую полезную информацию, которая помогает при обработке и логировании [^6].

### Основы создания пользовательских ошибок

В JavaScript все ошибки наследуют от встроенного класса `Error`. Мы можем расширить этот класс, добавив свои свойства и методы.

_Пример создания базового класса ошибки:_

```js
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;

    // Маркируем как операционную ошибку
    this.isOperational = isOperational;

    // Захватываем стек вызовов, исключая конструктор
    Error.captureStackTrace(this, this.constructor);
  }
}
```

Теперь класс `AppError` можно использовать в приложении для создания ошибок с дополнительной информацией.

```js
function getUserById(userId) {
  const user = database.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}
```

### Специализированные классы ошибок

На основе данной ошибки можно создавать специализированные классы для различных типов ошибок.

_Специализированные ошибки_ - это классы, которые наследуют от базового класса ошибки и добавляют специфическую логику или свойства. Например, можно создать класс для ошибок "_Не найдено_".

```js
// errors/NotFoundError.js

import { AppError } from "./AppError.js";

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}
```

А можно пойти дальше и создать класс ошибки для определенной сущности, например, для пользователя:

```js
// errors/UserNotFoundError.js

import { NotFoundError } from "./NotFoundError.js";

class UserNotFoundError extends NotFoundError {
  constructor(userId) {
    super(`User with ID ${userId} not found`);
  }
}

export { UserNotFoundError };
```

Рекомендуется создать еще несколько специализированных классов ошибок для распространенных ситуаций, таких как `ValidationError`, `AuthenticationError`, `AuthorizationError` и т.д.

```js
// errors/ValidationError.js
export default class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 400, true); // 400 - стандартный HTTP-код для ошибок валидации
    this.name = "ValidationError"; // имя ошибки
    this.errors = errors; // массив объектов с деталями: { field, message }
  }
}

// errors/AuthenticationError.js
class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

// errors/NotFoundError.js
class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}
```

Код становится более выразительным и легче поддерживаемым.

```js
import { ValidationError, NotFoundError, AuthenticationError } from "./errors";

// В контроллере
async function createUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required", "email");
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError("Email already registered", "email");
    }

    const user = await User.create({ email, password });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
```

## Глобальный обработчик ошибок

Если выбрасывать исключения и не обрабатывать их, приложение завершится с ошибкой при первом сбое. Чтобы этого избежать, необходимо предусмотреть централизованный механизм обработки ошибок, который будет возвращать клиенту понятные и структурированные ответы.

Вместо обработки ошибок в каждом маршруте рекомендуется реализовать глобальный обработчик ошибок [^7], способный обрабатывать все исключения, возникающие в приложении, в зависимости от их типа.

В контексте бэкенд-приложений (REST API) такой обработчик обычно реализуется в виде middleware в Express.js. Он перехватывает ошибки, возникающие при выполнении запросов, и возвращает клиенту ответ в формате JSON.

### Создание глобального обработчика

_Глобальный обработчик ошибок (error handler middleware)_ - это специальная middleware функция с четырьмя параметрами: (`err`, `req`, `res`, `next`).

```js
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";
  const statusCode = err.statusCode || 500;

  // Базовая структура ответа
  const response = {
    status: "error",
    message: err.message || "Unexpected error occurred",
  };

  // Добавляем детали валидации, если они есть
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    response.errors = err.errors;
  }

  // В режиме разработки добавляем стек
  if (isDev) {
    response.stack = err.stack;
  }

  // Логирование
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);

  // Отправляем ответ
  res.status(err.isOperational ? statusCode : 500).json(response);
};

export default errorHandler;
```

### Регистрация глобального обработчика

Глобальный обработчик ошибок должен быть зарегистрирован после всех маршрутов, чтобы он мог перехватывать ошибки, возникающие в них.

```js
import express from "express";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Регистрация маршрутов
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);

// Маршрут для несуществующих адресов
app.use((req, res, next) => {
  const error = new AppError("Route not found", 404);
  next(error);
});

// Регистрация глобального обработчика ошибок
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

## Асинхронная обработка ошибок

В асинхронном коде ошибки могут не быть перехвачены стандартными средствами, поскольку они возникают внутри промисов или асинхронных функций. В таких случаях исключение не передается в глобальный обработчик, если явно не вызвать `next(error)` [^8].

Чтобы гарантировать, что все ошибки - включая асинхронные - будут корректно обработаны, рекомендуется использовать _обёртки для асинхронных маршрутов_ (_async wrappers_). Такая обёртка автоматически перехватывает любые исключения, возникающие в async-функциях, и передаёт их в глобальный обработчик ошибок.

_Пример, когда ошибка не будет поймана:_

```js
app.get("/api/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  // Если здесь произойдёт ошибка, например при сбое соединения с БД,
  // она не будет автоматически передана в обработчик ошибок.
  res.json(user);
});
```

_Решение с обёрткой:_

```js
// middlewares/asyncWrapper.js
const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncWrapper;
```

```js
// Пример использования обёртки
import asyncWrapper from "./middlewares/asyncWrapper.js";

app.get(
  "/api/users/:id",
  asyncWrapper(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
  })
);

// или, если используется контроллер
app.get("/api/users/:id", asyncWrapper(userController.getUserById));

// Регистрация глобального обработчика ошибок
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

Такой подход обеспечивает единообразную обработку ошибок во всех маршрутах и упрощает поддержку кода.

## Валидация данных

_Валидация_ - это процесс проверки, соответствуют ли входные данные ожидаемому формату и правилам. Это первая линия защиты от некорректных данных.

### Ручная валидация

Самый простой способ - проверять данные вручную в коде:

```js
app.post("/register", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("Email and password are required", "email");
  }

  if (!isValidEmail(email)) {
    throw new ValidationError("Invalid email format", "email");
  }

  // Продолжение регистрации...
});
```

Если Вы хотите показать пользователю сразу все ошибки валидации, а не только первую, можно собрать их в массив и вернуть вместе:

```js
app.post('/register', (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  // проверка на сущществующего пользователя
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    errors.push({ field: 'email', message: 'Email is already in use' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: 'error', errors });
  }

  // Продолжение регистрации...
});
```

У данного метода есть свои недостатки:

- Много повторяющегося кода
- Сложность поддержки при изменении правил валидации
- Отсутствие централизованного управления ошибками валидации
- Трудности с масштабированием при большом количестве полей и сложных правилах

### Валидация с express-validator

Для упрощения валидации данных можно использовать специализированные библиотеки, например `express-validator` [^1]. Это популярный инструмент для Express-приложений, который позволяет задавать правила валидации в декларативной и читаемой форме.

_Установка_:

```bash
npm install express-validator
```

_Использование_:

```js
import { body, validationResult } from "express-validator";

// Middleware для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

app.post(
  "/register",
  [
    // Правила валидации
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain a number"),

    body("age")
      .optional()
      .isInt({ min: 18, max: 120 })
      .withMessage("Age must be between 18 and 120"),
  ],
  handleValidationErrors,
  async (req, res) => {
    // На этом этапе данные уже проверены
    const { name, email, password, age } = req.body;

    const user = await User.create({ name, email, password, age });
    res.status(201).json(user);
  }
);
```

Чтобы маршруты оставались чистыми и читабельными, правила валидации можно вынести в отдельный файл:

```js
// validators/userValidator.js
import { body } from "express-validator";

export const userValidationSchema = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),

  body("age")
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage("Age must be between 18 and 120"),
];
```

_Использование в маршрутах:_

```js
import { userValidationSchema } from "./validators/userValidator.js";

app.post(
  "/register",
  userValidationSchema,
  handleValidationErrors,
  async (req, res) => {
    // Здесь данные уже проверены
    const { name, email, password, age } = req.body;

    const user = await User.create({ name, email, password, age });
    res.status(201).json(user);
  }
);
```

Рекомендуется также _интегрировать валидацию с глобальным обработчиком ошибок_, чтобы централизованно управлять всеми ошибками в приложении.

_Изменение middleware для обработки ошибок валидации:_

```js
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    return next(new ValidationError("Validation failed", errorDetails));
  }
  next();
};
```

Теперь ошибки валидации будут обрабатываться глобальным обработчиком ошибок, что обеспечит единообразный формат ответов и централизованное логирование.

### Другие библиотеки валидации

Помимо express-validator, существуют другие популярные библиотеки:

- _Joi_ - мощная и гибкая библиотека с отличной поддержкой TypeScript, часто используется для валидации схем на уровне приложений [^2].
- _Yup_ - простая в использовании библиотека, популярна среди React разработчиков для валидации форм, но может использоваться и на сервере.
- _Zod_ - новая библиотека с нулевыми зависимостями, отличной поддержкой TypeScript и встроенной типизацией

Для Node.js backend обычно выбирают express-validator (специально для Express), Joi или Zod в зависимости от сложности валидации.

## Логирование

_Логирование_ — это процесс записи информации о событиях в приложении. Хорошее логирование — необходимость для production приложений [^12].

### Ручное логирование

В JS можно использовать встроенные методы `console.log`, `console.error` и `console.warn` для простого логирования.

```js
// Базовое ручное логирование
console.log("Server started on port 3000");
console.error("Database connection failed:", error);
console.warn("Cache is almost full");
```

Данный подход подходит для простых приложений и отладки, но не масштабируется и не предоставляет гибкости. Для production приложений рекомендуется использовать специализированные библиотеки логирования.

### Использование Winston для логирования

_Winston_ — одна из наиболее популярных библиотек логирования для Node.js. Она предоставляет гибкую систему с поддержкой разных уровней логирования и транспортов (места, куда отправляются логи) [^3].

_Установка:_

```bash
npm install winston
```

_Базовая настройка:_

```js
// utils/logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Минимальный уровень логирования

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }), // Сохранять stack trace
    winston.format.json() // Формировать логи в JSON
  ),

  // Где сохранять логи
  transports: [
    // Логи об ошибках в файл
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // Все логи в файл
    new winston.transports.File({
      filename: "logs/combined.log",
    }),

    // В разработке показывать в консоль
    ...(process.env.NODE_ENV !== "production"
      ? [new winston.transports.Console()]
      : []),
  ],
});
```

_Использование:_

```js
import logger from "./utils/logger.js";

// Логирование разных уровней
// 1 аргумент - сообщение, 2 аргумент - дополнительный контекст (объект)
logger.info("User registered", { userId: 123, email: "user@example.com" });
logger.warn("API rate limit approaching", { remaining: 10 });
logger.error("Database connection failed", { error: err.message });
```

### Уровни логирования

Winston поддерживает стандартные уровни логирования (от низшего к высшему приоритету):

| Уровень | Назначение                                  | Пример                                              |
| ------- | ------------------------------------------- | --------------------------------------------------- |
| silly   | Максимально подробная отладочная информация | Значения переменных в каждой строке                 |
| debug   | Отладочная информация для разработчиков     | Вход/выход из функций, значения параметров          |
| verbose | Дополнительная информация о работе          | Начало долгой операции, промежуточные шаги          |
| info    | Общая информация о работе приложения        | Сервер запущен, пользователь вошел, запрос завершен |
| warn    | Предупреждения о потенциальных проблемах    | Высокая нагрузка, приближение к лимитам             |
| error   | Ошибки, которые требуют внимания            | Ошибка базы данных, сбой сервиса                    |

### Логирование с контекстом запроса

Часто полезно добавлять информацию о запросе к каждому логу. Это можно сделать с помощью middleware, которое добавляет контекст к логам.

```js
// middlewares/requestLogger.js
import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  logger.info("Incoming request", {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // res.on('finish') - событие, которое срабатывает когда ответ отправлен
  // добавляем лог по завершению запроса
  res.on("finish", () => {
    logger.info("Request completed", {
      requestId,
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime,
    });
  });

  next();
};
```

_Использование в приложении:_

```js
const express = require("express");
const requestLogger = require("./middlewares/requestLogger");

const app = express();
app.use(requestLogger);

// Регистрация маршрутов
// ...

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});
```

### Интеграция с внешними сервисами. Sentry

_Sentry_ — это сервис для отслеживания ошибок в реальном времени [^4]. Когда происходит необработанная ошибка, Sentry автоматически отправляет информацию на свой сервер, где вы можете видеть стек вызовов, информацию об окружении и историю ошибок.

_Установка:_

```bash
npm install @sentry/node @sentry/tracing
```

_Базовая настройка:_

```js
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import express from "express";

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Получаете на сайте Sentry
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Записывать 100% трассировок (в production снизить)
});

app.use(Sentry.Handlers.requestHandler());

// Ваши маршруты здесь
// ...

app.use(Sentry.Handlers.errorHandler());
```

Рекомендуется в глобальном обработчике ошибок добавлять отправку ошибок в Sentry:

```js
import * as Sentry from "@sentry/node";

const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";
  const statusCode = err.statusCode || 500;

  const response = {
    status: "error",
    message: err.message || "Unexpected error occurred",
  };

  if (Array.isArray(err.errors) && err.errors.length > 0) {
    response.errors = err.errors;
  }

  if (isDev) {
    response.stack = err.stack;
  }

  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);

  // Отправка ошибки в Sentry, если ошибка не является операционной
  // Если ошибка операционная, её можно не отправлять, чтобы не засорять Sentry
  if (!err.isOperational) {
    Sentry.captureException(err);
  }

  res.status(err.isOperational ? statusCode : 500).json(response);
};
```

_Преимущества Sentry_:

- Автоматическое отслеживание необработанных ошибок
- Красивый интерфейс для просмотра ошибок
- Группировка похожих ошибок
- История возникновения ошибок
- Информация об окружении (Node версия, зависимости и т.д.)
- Интеграция с системами мониторинга

### Интеграция с внешними системами логирования

Помимо Sentry, существуют и другие сервисы для централизованного логирования и мониторинга, чтобы логи не отправлялись в файлы на сервере, а собирались в одном месте.

Одна из популярных систем - _Logtail_, она имеет бесплатный тариф и простую интеграцию с Node.js через библиотеку `@logtail/winston`.

_Установка:_

```bash
npm install @logtail/winston
```

_Интеграция с Winston:_

```js
import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  transports: [
    new LogtailTransport(logtail),
    ...(process.env.NODE_ENV !== "production"
      ? [new winston.transports.Console()]
      : []),
  ],
});

logger.info("Server started successfully", { port: 3000 });
logger.error("Something went wrong", { userId: 123 });
```

После подключения все логи будут доступны в веб-интерфейсе Logtail, где их можно фильтровать и просматривать в реальном времени.

## Организация кода

Хороша организация кода помогает избежать дублирования и делает обслуживание приложения проще.

Рекомендуется следующая структура.

```
src/
├── errors/                 # Кастомные классы ошибок
│   ├── AppError.js
│   ├── ValidationError.js
│   ├── NotFoundError.js
│   └── AuthenticationError.js
├── middlewares/            # Middleware функции
│   ├── errorHandler.js     # Глобальный обработчик ошибок
│   ├── requestLogger.js    # Логирование запросов
│   └── asyncHandler.js     # Wrapper для async функций
├── validators/           # Схемы валидации
│   └── userValidator.js    # Валидация данных пользователя
├── utils/
│   └── logger.js           # Конфигурация логирования
└── app.js               # Главный файл приложения
```

## Дополнительно. Расширенная архитектура обработки ошибок

Для больших приложений может быть полезна более сложная архитектура обработки ошибок, когда ошибки расширяются и используются с дополнительной контекстной информацией.

### Паттерн с регистром обработчиков

_Паттерн с регистром обработчиков_ позволяет централизованно управлять обработкой различных типов ошибок. Идея заключается в создании реестра (регистра) обработчиков ошибок, где каждый тип ошибки ассоциируется с определённой функцией обработки.

```js
// errors/Handler.js
class ErrorHandler {
  constructor() {
    this.handlers = new Map();
  }

  // Регистрируем обработчик для определенного типа ошибки
  register(ErrorClass, handler) {
    this.handlers.set(ErrorClass, handler);
  }

  // Находим подходящий обработчик и применяем его
  handle(error, req, res) {
    for (const [ErrorClass, handler] of this.handlers) {
      if (error instanceof ErrorClass) {
        return handler(error, req, res);
      }
    }

    // Обработчик по умолчанию
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default new ErrorHandler();
```

```js
// errors/errorHandlers.js
import ErrorHandler from "./Handler.js";
import { BookNotFoundError, ValidationError } from "./index.js";

// Регистрируем обработчики
ErrorHandler.register(BookNotFoundError, (error, req, res) => {
  return res.status(404).json({
    status: "not_found",
    message: error.message,
  });
});

ErrorHandler.register(ValidationError, (error, req, res) => {
  return res.status(400).json({
    status: "validation_error",
    message: error.message,
    errors: error.errors,
  });
});

ErrorHandler.register(AppError, (error, req, res) => {
  return res.status(error.statusCode).json({
    status: "error",
    message: error.message,
  });
});

// Обработчик по умолчанию для всех остальных ошибок
ErrorHandler.register(Error, (error, req, res) => {
  console.error("Unexpected error:", error);
  // Здесь можно добавить дополнительную логику, например, отправку уведомлений в Sentry
  return res.status(500).json({
    message: "Something went wrong",
  });
});

export { ErrorHandler };
```

```js
// middlewares/errorHandler.js
import ErrorHandler from "../errors/errorHandlers.js";

const errorHandlingMiddleware = (err, req, res, next) => {
  ErrorHandler.handle(err, req, res);
};

export default errorHandlingMiddleware;
```

_Этот подход позволяет_:

- Централизованно определять, как обрабатывать разные типы ошибок
- Легко добавлять новые типы ошибок и их обработчики
- Переиспользовать логику обработки в разных частях приложения
- Тестировать обработчики отдельно

[^1]: _Using Express-Validator for Data Validation in Node.js_. betterstack [online]. Available at: https://betterstack.com/community/guides/scaling-nodejs/express-validator-nodejs/
[^2]: _Joi vs Zod: Choosing the Right Validation Library_. betterstack [online]. Available at: https://betterstack.com/community/guides/scaling-nodejs/joi-vs-zod/
[^3]: _Mastering Winston for Production Logging in Node.js_. dash0 [online]. Available at: https://www.dash0.com/guides/winston-production-logging-nodejs
[^4]: _How to Add Sentry Integration to your NodeJS App_. dev.to [online]. Available at: https://dev.to/yusadolat/how-to-add-sentry-integration-to-your-nodejs-app-26eo
[^5]: _Mastering Node.js Error Handling: Building Resilient Applications_. karandeepsingh [online]. Available at: https://karandeepsingh.ca/posts/nodejs-error-handling-best-practices/
[^6]: _Error handling_. expressjs [online]. Available at: https://expressjs.com/en/guide/error-handling.html
[^7]: _Global Error Handling in Express.js: Best Practices_. dev.to [online]. Available at: https://dev.to/shyamtala/global-error-handling-in-expressjs-best-practices-4957
[^8]: _Async Error Handling in Node.js: 4 Best Practices_. dev.to [online]. Available at: https://dev.to/artem_turlenko/async-error-handling-in-nodejs-4-best-practices-2j35
[^9]: _Distinguish operational vs programmer errors_. GitHub [online]. Available at: https://github.com/goldbergyoni/nodebestpractices/blob/HEAD/sections/errorhandling/operationalvsprogrammererror.md
[^10]: _A Comprehensive Guide To Error Handling In Node.js_. dev.to [online]. Available at: https://dev.to/honeybadger/a-comprehensive-guide-to-error-handling-in-nodejs-15cn
[^11]: _Pino vs Winston: Which Node.js Logger Should You Choose?_. betterstack [online]. Available at: https://betterstack.com/community/comparisons/pino-vs-winston/
[^12]: _Best Practices for Logging in Node.js_. dev.to [online]. Available at: https://dev.to/appsignal/best-practices-for-logging-in-node-js-1p4h
