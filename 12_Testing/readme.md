# Тестирование бэкенд-приложений

## Содержание

- [Тестирование бэкенд-приложений](#тестирование-бэкенд-приложений)
  - [Содержание](#содержание)
  - [Предисловие: История, которая вас заставит писать тесты](#предисловие-история-которая-вас-заставит-писать-тесты)
  - [Введение в тестирование](#введение-в-тестирование)
    - [Что такое тестирование бэкенд приложений?](#что-такое-тестирование-бэкенд-приложений)
    - [Зачем нужно тестирование?](#зачем-нужно-тестирование)
  - [Виды тестирования](#виды-тестирования)
    - [Юнит тестирование (Unit Testing)](#юнит-тестирование-unit-testing)
    - [Интеграционное тестирование (Integration Testing)](#интеграционное-тестирование-integration-testing)
    - [E2E тестирование (End-to-End Testing)](#e2e-тестирование-end-to-end-testing)
    - [Нагрузочное тестирование (Load Testing)](#нагрузочное-тестирование-load-testing)
    - [Другие виды тестирования](#другие-виды-тестирования)
  - [Jest: фреймворк для тестирования](#jest-фреймворк-для-тестирования)
    - [Почему Jest?](#почему-jest)
    - [Установка и базовая настройка](#установка-и-базовая-настройка)
    - [Создание первого теста](#создание-первого-теста)
    - [Утверждения](#утверждения)
  - [Тестирование бэкенд приложений с Supertest](#тестирование-бэкенд-приложений-с-supertest)
    - [Что такое Supertest?](#что-такое-supertest)
    - [Установка Supertest](#установка-supertest)
    - [Базовое использование Supertest](#базовое-использование-supertest)
  - [Mocking и Stubbing](#mocking-и-stubbing)
    - [Понимание Mock и Stub](#понимание-mock-и-stub)
    - [Зачем использовать Mock и Stub?](#зачем-использовать-mock-и-stub)
    - [Mocking с Jest](#mocking-с-jest)
      - [Пример Mocking функции](#пример-mocking-функции)
    - [Spying на функции](#spying-на-функции)
  - [Методологии тестирования: TDD и BDD](#методологии-тестирования-tdd-и-bdd)
    - [TDD: Test-Driven Development](#tdd-test-driven-development)
      - [Что такое TDD?](#что-такое-tdd)
      - [Пример TDD: реализация функции валидации почты](#пример-tdd-реализация-функции-валидации-почты)
      - [Преимущества TDD](#преимущества-tdd)
    - [BDD: Behavior-Driven Development](#bdd-behavior-driven-development)
      - [Что такое BDD?](#что-такое-bdd)
      - [BDD с Jest](#bdd-с-jest)
  - [Лучшие практики тестирования](#лучшие-практики-тестирования)
    - [Arrange-Act-Assert (AAA) паттерн](#arrange-act-assert-aaa-паттерн)
    - [One assertion per test (когда возможно)](#one-assertion-per-test-когда-возможно)
    - [Тестируйте граничные случаи (Edge Cases)](#тестируйте-граничные-случаи-edge-cases)
    - [Используйте Setup и Teardown](#используйте-setup-и-teardown)
    - [Тестируйте поведение, а не реализацию](#тестируйте-поведение-а-не-реализацию)
    - [Избегайте флаксных тестов](#избегайте-флаксных-тестов)
  - [Покрытие кода тестами (Code Coverage)](#покрытие-кода-тестами-code-coverage)
    - [Что такое покрытие?](#что-такое-покрытие)
    - [Создание отчёта о покрытии](#создание-отчёта-о-покрытии)
    - [Установка минимума покрытия](#установка-минимума-покрытия)
  - [Документация тестов](#документация-тестов)
    - [Важность документации тестов](#важность-документации-тестов)
    - [Примеры хорошей документации](#примеры-хорошей-документации)

## Предисловие: История, которая вас заставит писать тесты

Представьте ситуацию: вы разработали приложение для заказа еды. Функционирует отлично, вы развернули его на production, пользователи начали создавать заказы. Всё работает идеально — пока...

Однажды разработчик James решил оптимизировать код. Он изменил функцию расчёта стоимости доставки. Тестировал локально — вроде всё работает. Развернул на production.

Через час поступают жалобы:

- Клиент заказал еду на сумму 500 рублей, система взяла 50 рублей
- Клиент вместо доставки за 150 рублей заплатил 1500 рублей
- Клиент не получил свой заказ, потому что система отклонила платёж

За два часа компания потеряла десятки тысяч рублей, репутацию пошатнулась, а то и судебные иски пошли. Если бы было 50 тестов, покрывающих функцию расчёта, Василий узнал бы о проблеме ДО развёртывания.

Именно поэтому тестирование — это неотъемлемая часть разработки. Оно помогает выявить ошибки до того, как они попадут к пользователям, экономит время и ресурсы, а также поддерживает качество кода на высоком уровне.

## Введение в тестирование

### Что такое тестирование бэкенд приложений?

_Тестирование бэкенд приложений_ - это процесс проверки корректности работы серверной части приложения без прямого взаимодействия с пользовательским интерфейсом. Это означает, что мы проверяем функциональность API-эндпоинтов, обработку данных, взаимодействие с базами данных и логику обработки запросов.

Представьте ресторан: если фронтенд — это то, что видит клиент (меню, интерфейс), то бэкенд — это кухня. Тестирование бэкенда гарантирует, что рецепты готовятся правильно, ингредиенты свежие, и блюдо будет готово вовремя, даже если никто его не видит.

### Зачем нужно тестирование?

Рассмотрим реальные цифры и последствия из-за отсутствия тестирования:

- _$4.7 млрд_. Столько потеряла компания Amazon из-за одного часа простоя в 2013 году. Причина — ошибка в коде, которую могли бы поймать тесты.
- _8 месяцев работы_. Столько времени потребовалось на исправление «маленькой» ошибки в системе расчётов банка, которая привела к переводу миллионов по ошибочным счётам.
- _100x стоимость_. Исправление бага, обнаруженного на production, стоит в 100 раз дороже, чем если бы его нашли на этапе разработки.

Тестирование решает множество задач:

- _Раннее обнаружение ошибок_. Баги, обнаруженные на ранних стадиях разработки, стоят намного дешевле, чем исправление их в production после жалоб пользователей.
- _Уверенность в коде_. Когда у вас есть набор тестов, вы можете безопасно рефакторить код, зная, что тесты поймают любые регрессии.
- _Документация функциональности_. Тесты служат живой документацией — они показывают, как должен работать код.
- _Снижение затрат на отладку_. Вместо ручного тестирования каждого сценария, тесты автоматически проверяют сотни комбинаций за несколько минут.
- _Повышение качества кода_. Тестируемый код обычно имеет лучшую архитектуру и слабую связанность.
- _Скорость разработки_. Противоречиво звучит, но команда с хорошим покрытием тестами работает быстрее, потому что тратит меньше времени на отладку и исправление багов.

## Виды тестирования

### Юнит тестирование (Unit Testing)

_Юнит тестирование_ — это тестирование отдельных функций или методов в изоляции от остальной системы. Это наиболее простой и быстрый вид тестирования.

_Характеристики_:

- Тестируется одна функция или метод
- Все зависимости подменяются (мокируются)
- Тесты выполняются очень быстро
- Легко отследить причину ошибки

_Пример. Тестирование функции, которая вычисляет сумму двух чисел_

```js
// src/math.js
function sum(a, b) {
  return a + b;
}

export default sum;
```

```js
// tests/math.test.js
import sum from "../src/math";

// describe, it - функции для организации тестов
// describe - группа тестов
// it - отдельный тест
// данные функции будут рассмотрены позже
describe("sum function", () => {
  it("should add two positive numbers correctly", () => {
    expect(sum(2, 3)).toBe(5);
  });

  it("should add negative numbers correctly", () => {
    expect(sum(-2, -3)).toBe(-5);
  });

  it("should handle zero", () => {
    expect(sum(0, 5)).toBe(5);
  });
});
```

### Интеграционное тестирование (Integration Testing)

_Интеграционное тестирование_ проверяет взаимодействие между несколькими компонентами системы. Это более сложно чем юнит тестирование, но ближе к реальности.

_Характеристики_:

- Тестируется взаимодействие нескольких модулей
- Может использоваться реальная база данных или её in-memory версия, _но никогда не используется production база-данных_
- Тесты выполняются медленнее, чем юнит тесты
- Проверяет, что компоненты работают вместе правильно

_Пример: Тестирование создания задачи в ToDo приложении_

```js
// src/controllers/todoController.js
import TodoModel from "../models/todoModel";

async function createTodo(req, res) {
  try {
    const { title, description } = req.body;
    const todo = await TodoModel.create({ title, description });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default createTodo;
```

```js
// src/models/todoModel.js
import pool from "../db/pool";

async function create(todoData) {
  const { title, description } = todoData;
  const result = await pool.query(
    "INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *",
    [title, description]
  );
  return result.rows[0];
}

export default { create };
```

```js
// tests/todoController.integration.test.js
import request from "supertest";
import app from "../src/app"; // Express приложение
import TodoModel from "../src/models/todoModel";

describe("Todo Controller Integration Tests", () => {
  beforeEach(async () => {
    // Очищаем БД перед каждым тестом
    await TodoModel.deleteMany({});
  });

  it("should create a new todo", async () => {
    // Выполняем HTTP запрос к нашему API
    const response = await request(app)
      .post("/todos")
      .send({
        title: "Learn testing",
        description: "Master Jest and Supertest",
      })
      .expect(201);

    expect(response.body.title).toBe("Learn testing");
    expect(response.body.id).toBeDefined();

    // Проверяем, что todo действительно сохранён в БД
    const savedTodo = await TodoModel.findById(response.body.id);
    expect(savedTodo).toBeDefined();
  });
});
```

### E2E тестирование (End-to-End Testing)

_E2E тестирование_ проверяет всю систему целиком, имитируя реальные сценарии использования. Это самый сложный и медленный вид тестирования, но он обеспечивает наибольшую уверенность в работоспособности приложения.

_Характеристики_:

- Тестируется вся система от начала до конца
- Используются реальные базы данных и внешние сервисы (или их тестовые аналоги)
- Тесты выполняются медленно
- Проверяет, что все компоненты работают вместе правильно
- Имитирует поведение реальных пользователей

_Пример: Тестирование полного сценария заказа еды_

```js
// tests/foodOrder.e2e.test.js
import request from "supertest";
import app from "../src/app"; // Express приложение
import UserModel from "../src/models/userModel";
import OrderModel from "../src/models/orderModel";
describe("Food Order E2E Tests", () => {
  let userToken;

  beforeAll(async () => {
    // Создаём тестового пользователя и получаем токен аутентификации
    const userResponse = await request(app)
      .post("/users/register")
      .send({ username: "testuser", password: "password" });
    const loginResponse = await request(app)
      .post("/users/login")
      .send({ username: "testuser", password: "password" });
    userToken = loginResponse.body.token;
  });

  it("should place a food order successfully", async () => {
    // Шаг 1: Создаём заказ
    const orderResponse = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [
          { id: 1, quantity: 2 },
          { id: 3, quantity: 1 },
        ],
        address: "123 Main St",
      })
      .expect(201);

    expect(orderResponse.body.status).toBe("pending");
    expect(orderResponse.body.total).toBeDefined();

    // Шаг 2: Проверяем статус заказа
    const statusResponse = await request(app)
      .get(`/orders/${orderResponse.body.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(statusResponse.body.status).toBe("pending");
  });
});
```

### Нагрузочное тестирование (Load Testing)

_Нагрузочное тестирование_ проверяет, как приложение работает под нагрузкой. Это важно для понимания масштабируемости.

_Характеристики_:

- Имитирует большое количество одновременных пользователей
- Измеряет время ответа, пропускную способность
- Помогает найти узкие места
- Используются специализированные инструменты (например, JMeter, Artillery)

_Пример: Использование Artillery для нагрузочного тестирования API_

```yaml
# artillery-config.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10 # 10 запросов в секунду

scenarios:
  - name: "Create and read todos"
    flow:
      - post:
          url: "/todos"
          json:
            title: "Test todo {{ $randomNumber(1, 1000) }}"
      - get:
          url: "/todos"
```

Для запуска теста используется команда:

```bash
artillery run artillery-config.yml
```

### Другие виды тестирования

Существуют и другие виды тестирования, которые могут быть полезны в зависимости от специфики вашего приложения:

- _Тестирование безопасности (Security Testing)_: Выявляет уязвимости в системе, такие как SQL-инъекции, XSS и другие атаки.
- _Тестирование совместимости (Compatibility Testing)_: Проверяет, как приложение работает в различных средах, с разными версиями баз данных, операционных систем и т.д.
- _Регрессионное тестирование (Regression Testing)_: Проверяет, что новые изменения в коде не нарушили существующую функциональность.
- _Тестирование API (API Testing)_: Специализированное тестирование для проверки корректности работы API-эндпоинтов, включая проверку запросов и ответов, аутентификации и авторизации.

## Jest: фреймворк для тестирования

Чаще всего при написании тестов используются специализированные фреймворки, так как они предоставляют удобные инструменты и функции для организации и выполнения тестов. Один из самых популярных фреймворков для тестирования в JavaScript и Node.js — это Jest.

### Почему Jest?

Jest — это популярный фреймворк для тестирования JavaScript приложений, особенно для Node.js.

_Преимущества Jest_:

- _Zero configuration_. Работает "из коробки" без сложной настройки
- _Быстрый_. Параллельно запускает тесты
- _Изолированность_. Каждый тест изолирован от других
- _Встроенная функциональность_. Не нужны отдельные библиотеки для assertions и mocking
- _Отличная документация_. Много примеров и гайдов

### Установка и базовая настройка

Установка Jest в проект:

```bash
# Установка Jest
npm install --save-dev jest
```

Обновление package.json для добавления скрипта запуска тестов:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

- `npm run test` — запуск всех тестов
- `npm run test:watch` — запуск тестов в режиме наблюдения (перезапуск при изменении файлов)
- `npm run test:coverage` — запуск тестов с генерацией отчёта о покрытии кода тестами

### Создание первого теста

Представим модуль, который выполняет математические операции. Создадим файл `math.js`:

```js
// src/math.js

function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

export { add, multiply };
```

Для тестирования этого модуля создадим файл `math.test.js`:

```js
// tests/math.test.js
import { add, multiply } from "../src/math";

describe("Math Module", () => {
  describe("add function", () => {
    it("should add two numbers correctly", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("should handle negative numbers", () => {
      expect(add(-2, 3)).toBe(1);
    });
  });

  describe("multiply function", () => {
    it("should multiply two numbers correctly", () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it("should return 0 when multiplying by 0", () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });
});
```

Для запуска тестов используем команду:

```bash
npm run test
```

В данном случае было проведено юнит тестирование функций `add` и `multiply`. Как можно заметить, мы выполнили тестирование отдельных функций в изоляции, и не использовали реальные зависимости.

### Утверждения

В Jest для проверки результатов используются утверждения (assertions).

Утверждения - это выражения, которые проверяют, соответствует ли фактический результат ожидаемому. Если утверждение не выполняется, тест считается проваленным.

Общий синтаксис утверждения в Jest:

```js
expect(actual).matcher(expected);
```

- `actual` - фактическое значение, полученное в результате выполнения кода
- `matcher` - метод, который определяет тип проверки (например, `toBe`, `toEqual`, `toContain` и т.д.)
- `expected` - ожидаемое значение для сравнения

Jest предоставляет множество встроенных матчеров для различных типов проверок:

```js
// Простые проверки
expect(value).toBe(expectedValue); // Точное совпадение
expect(value).toEqual(expectedValue); // Глубокое сравнение объектов
expect(value).not.toBe(expectedValue); // Отрицание

// Числа
expect(value).toBeGreaterThan(3);
expect(value).toBeCloseTo(0.1 + 0.2); // Для чисел с плавающей точкой

// Строки
expect(str).toMatch(/regex/);
expect(str).toContain("substring");

// Массивы
expect(array).toContain(element);
expect(array).toHaveLength(3);

// Функции
expect(fn).toThrow(Error);
expect(fn).toThrow("error message");

// Асинхронный код
expect(promise).resolves.toBe(value);
expect(promise).rejects.toThrow();

// Existence
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();
```

## Тестирование бэкенд приложений с Supertest

### Что такое Supertest?

_Supertest_ — это библиотека для тестирования HTTP API серверов. Она позволяет делать HTTP запросы к приложению и проверять ответы, не запуская реальный сервер на порту. То есть библиотека может симулировать поведение клиента, отправляя запросы к вашему бэкенду и проверяя ответы.

### Установка Supertest

Для установки Supertest в проект используйте следующую команду:

```bash
npm install --save-dev supertest
```

### Базовое использование Supertest

Создадим простое ToDo приложение на Express:

```js
// src/app.js
const express = require("express");
const app = express();

app.use(express.json());

let todos = [
  { id: 1, title: "Learn testing", completed: false },
  { id: 2, title: "Build a project", completed: false },
];

// GET все задачи
app.get("/todos", (req, res) => {
  res.json(todos);
});

// GET одну задачу
app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
});

// POST новую задачу
app.post("/todos", (req, res) => {
  const { title } = req.body;

  // Валидация
  if (!title || typeof title !== "string") {
    return res
      .status(400)
      .json({ error: "Title is required and must be string" });
  }

  const newTodo = {
    id: Math.max(...todos.map((t) => t.id), 0) + 1,
    title,
    completed: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT обновить задачу
app.put("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const { title, completed } = req.body;
  if (title) todo.title = title;
  if (typeof completed === "boolean") todo.completed = completed;

  res.json(todo);
});

// DELETE удалить задачу
app.delete("/todos/:id", (req, res) => {
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const deletedTodo = todos.splice(index, 1);
  res.json(deletedTodo);
});

export default app;
```

Для тестирования этого приложения с помощью Supertest создадим файл `todo.test.js`:

```js
// tests/todo.test.js

import request from "supertest";
import app from "../src/app";

describe("Todo API", () => {
  describe("GET /todos", () => {
    it("should return all todos", async () => {
      const response = await request(app)
        .get("/todos")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /todos/:id", () => {
    it("should return a specific todo", async () => {
      const response = await request(app).get("/todos/1").expect(200);

      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("completed");
    });

    it("should return 404 for non-existent todo", async () => {
      await request(app).get("/todos/99999").expect(404);
    });
  });

  describe("POST /todos", () => {
    it("should create a new todo", async () => {
      const newTodo = { title: "Test new todo" };

      const response = await request(app)
        .post("/todos")
        .send(newTodo)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe("Test new todo");
      expect(response.body.completed).toBe(false);
    });

    it("should return 400 if title is missing", async () => {
      const response = await request(app).post("/todos").send({}).expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Title is required");
    });

    it("should return 400 if title is not a string", async () => {
      const response = await request(app)
        .post("/todos")
        .send({ title: 123 })
        .expect(400);

      expect(response.body.error).toContain("must be string");
    });
  });

  describe("PUT /todos/:id", () => {
    it("should update todo title", async () => {
      const response = await request(app)
        .put("/todos/1")
        .send({ title: "Updated title" })
        .expect(200);

      expect(response.body.title).toBe("Updated title");
    });

    it("should update todo completion status", async () => {
      const response = await request(app)
        .put("/todos/1")
        .send({ completed: true })
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    it("should return 404 for non-existent todo", async () => {
      await request(app)
        .put("/todos/99999")
        .send({ title: "Updated" })
        .expect(404);
    });
  });

  describe("DELETE /todos/:id", () => {
    it("should delete a todo", async () => {
      await request(app).delete("/todos/1").expect(200);
    });

    it("should return 404 when deleting non-existent todo", async () => {
      await request(app).delete("/todos/99999").expect(404);
    });
  });
});
```

## Mocking и Stubbing

### Понимание Mock и Stub

_Mock_ — это подделка реального объекта, которая имитирует его поведение для целей тестирования.

_Stub_ — это упрощённая версия функции или объекта, которая возвращает заранее определённые значения.

### Зачем использовать Mock и Stub?

Когда вы тестируете определенную функциональность вашего приложения, вам не всегда нужно взаимодействовать с реальными зависимостями, например, с базой данных или внешними API. Вам достаточно получить предсказуемый результат от этих зависимостей, чтобы сосредоточиться на тестируемом коде.

Например, если вы тестируете функцию, которая сохраняет пользователя в базу данных, вам не нужно на самом деле подключаться к базе данных, вам достаточно убедиться, что функция вызывает метод сохранения с правильными параметрами и обрабатывает результат корректно.

В данном случае вы можете использовать Mock или Stub для замены реальной базы данных на поддельный объект, который будет вести себя так, как вам нужно для теста.

### Mocking с Jest

Jest предоставляет встроенные возможности для создания Mock и Stub объектов.

#### Пример Mocking функции

```js
// src/userModel.js

async function saveUser(userData) {
  // Логика сохранения пользователя в базу данных
  // Возвращает сохранённого пользователя
  return { id, ...userData };
}

export default { saveUser };
```

```js
// src/userModel.js

async function saveUser(userData) {
  // Логика сохранения пользователя в базу данных
  // Возвращает сохранённого пользователя
  return { id, ...userData };
}

export default { saveUser };
```

```js
// src/controllers/userController.js

import UserModel from "../userModel.js";

export async function registerUser(req, res) {
  try {
    const saved = await UserModel.saveUser(req.body);
    res.status(201).json(saved);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
```

В данном примере, мы хотим протестировать запрос, но не хотим взаимодействовать с реальной базой данных. Вместо этого мы замокаем функцию `saveUser`.

```js
// src/controllers/userController.test.js
import * as UserModel from "../userModel.js";
import { registerUser } from "./userController";

jest.mock("../userModel.js");

describe("registerUser controller", () => {
  beforeEach(() => {
    // Очистка всех моков перед каждым тестом
    jest.clearAllMocks();
  });

  it("should save user and return saved user", async () => {
    // Arrange
    const mockUser = { name: "Alice", email: "alice@example.com" };
    const mockSaved = { id: "abc123", ...mockUser };

    // mockResolvedValueOnce используется для имитации успешного сохранения пользователя
    UserModel.saveUser.mockResolvedValueOnce(mockSaved);

    // Создаём объекты запроса/ответа
    const req = { body: mockUser };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Act
    await registerUser(req, res);

    // Assert
    expect(UserModel.saveUser).toHaveBeenCalledWith(mockUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockSaved);
  });

  it("should return 500 if saveUser fails", async () => {
    // Вместо new Error можно использовать вашу собственную ошибку
    UserModel.saveUser.mockRejectedValueOnce(new Error("DB Error"));

    const req = { body: { name: "Bob", email: "bob@example.com" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB Error" });
  });
});
```

> В этом тесте мокируется только функция взаимодействия с реальной базой (saveUser), а бизнес-логика контроллера тестируется изолированно.

Таким же образом можно замокать любые другие зависимости, такие как внешние API, файловые системы и т.д.

### Spying на функции

Иногда вместо полного мока функции, вам нужно просто отследить её вызовы и аргументы. Для этого в Jest используется _spy_.

Рассмотрим класс для логирования.

```js
// src/logger.js
class Logger {
  info(message) {
    console.log(`[INFO] ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
  }
}

export default Logger;
```

Для тестирования функции, которая использует Logger, мы можем создать шпион на метод `info`.

```js
// tests/logger.test.js

import Logger from "../src/logger.js";

describe("Logger", () => {
  it("should log messages", () => {
    const logger = new Logger();
    const infoSpy = jest.spyOn(logger, "info");

    logger.info("Test message");

    // Проверяем, что метод был вызван
    // Был вызван с правильным аргументом и ровно один раз
    expect(infoSpy).toHaveBeenCalledWith("Test message");
    expect(infoSpy).toHaveBeenCalledTimes(1);

    // Очищаем spy
    infoSpy.mockRestore();
  });
});
```

## Методологии тестирования: TDD и BDD

### TDD: Test-Driven Development

#### Что такое TDD?

_Test-Driven Development (TDD)_ — это методология разработки, где сначала пишутся тесты, а потом код, который эти тесты должен пройти.

Цикл TDD состоит из трёх этапов:

- `Red` — напишите тест, который не проходит
- `Green` — напишите минимальный код, чтобы тест прошёл
- `Refactor` — улучшите код, не нарушая тесты

#### Пример TDD: реализация функции валидации почты

_Шаг 1. Red — пишем падающие тесты_

```js
import { validateEmail } from "../src/validation.js";

describe("Email Validator (TDD)", () => {
  it("should accept valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("john.doe@company.co.uk")).toBe(true);
  });

  it("should reject emails without @", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("should reject emails without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(validateEmail("")).toBe(false);
  });
});
```

Запускаем: `npm test` — все тесты падают

_Шаг 2. Green — пишем минимальный код_

```js
// src/emailValidator.js
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export { validateEmail };
```

Запускаем: `npm test` — все тесты проходят

_Шаг 3. Refactor — улучшаем код_

```js
// src/emailValidator.js
function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }

  // Простая проверка базовой структуры email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
}

export { validateEmail };
```

Запускаем: `npm test` — тесты всё ещё проходят

#### Преимущества TDD

- _Меньше багов_. Вы думаете о требованиях перед кодированием
- _Лучший дизайн_. Тестируемый код обычно лучше спроектирован
- _Живая документация_. Тесты показывают, как использовать код
- _Безопасный рефакторинг_. Вы можете менять код без страха что-то сломать

### BDD: Behavior-Driven Development

#### Что такое BDD?

_BDD расширяет TDD_, добавляя фокус на поведение системы с точки зрения пользователя. BDD использует язык, понятный как разработчикам, так и бизнес-аналитикам.

#### BDD с Jest

Jest поддерживает BDD стиль через функции `describe`, `it`, которые мы уже использовали. Ключевая разница — в том, как мы формулируем тесты:

```js
// Вместо технического описания...
describe("add", () => {
  it("returns sum", () => {
    expect(add(2, 2)).toBe(4);
  });
});

// Пишем так, как бизнес понимает функциональность...
describe("Todo application", () => {
  describe("When user creates a new todo", () => {
    it("should save the todo to the list", async () => {
      const response = await request(app)
        .post("/todos")
        .send({ title: "Buy groceries" });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Buy groceries");
    });

    it("should return an error if title is missing", async () => {
      const response = await request(app).post("/todos").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("When user marks a todo as completed", () => {
    it("should update the todo status", async () => {
      const response = await request(app)
        .put("/todos/1")
        .send({ completed: true });

      expect(response.body.completed).toBe(true);
    });
  });
});
```

## Лучшие практики тестирования

### Arrange-Act-Assert (AAA) паттерн

_Arrange-Act-Assert (AAA)_ — это паттерн организации тестов, который помогает структурировать тесты для лучшей читаемости и поддержки.

Структурируйте ваши тесты в три фазы:

- `Arrange` — подготовка данных и окружения для теста
- `Act` — выполнение действия, которое вы хотите протестировать
- `Assert` — проверка результатов

```js
describe("Todo API", () => {
  it("should create and retrieve a todo", async () => {
    // ARRANGE - подготовка данных и окружения
    const newTodoData = {
      title: "Complete the project",
      description: "Finish backend testing",
    };

    // ACT - выполнение действия
    const createResponse = await request(app).post("/todos").send(newTodoData);

    const todoId = createResponse.body.id;

    const getResponse = await request(app).get(`/todos/${todoId}`);

    // ASSERT - проверка результатов
    expect(createResponse.status).toBe(201);
    expect(getResponse.body.title).toBe(newTodoData.title);
    expect(getResponse.body.description).toBe(newTodoData.description);
  });
});
```

### One assertion per test (когда возможно)

_One assertion per test_ — это практика, которая рекомендует ограничивать количество утверждений в одном тесте до одного, когда это возможно. Это помогает сделать тесты более понятными и облегчает диагностику ошибок.

> Хотя это не священный закон, один assert на тест делает сообщения об ошибках чётче.

```js
// Плохо - слишком много проверок
it("should create a todo", async () => {
  const res = await request(app).post("/todos").send({ title: "Test" });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("id");
  expect(res.body.title).toBe("Test");
  expect(res.body.completed).toBe(false);
});

// Хорошо - отдельные тесты
it("should return 201 status", async () => {
  const res = await request(app).post("/todos").send({ title: "Test" });
  expect(res.status).toBe(201);
});

it("should return created todo with correct data", async () => {
  const res = await request(app).post("/todos").send({ title: "Test" });
  expect(res.body).toHaveProperty("id");
  expect(res.body.title).toBe("Test");
});
```

### Тестируйте граничные случаи (Edge Cases)

_Граничные случаи_ — это ситуации, которые находятся на границе допустимых значений или условий. Тестирование таких случаев помогает выявить ошибки, которые могут возникнуть в экстремальных ситуациях. Не нужно тестировать только "средние" или все возможные случаи, важно уделять внимание именно граничным.

Например, если у вас есть функция, которая валидирует заголовок задачи, вы должны проверить:

- Пустую строку
- Максимально длинную строку (например, 255 символов)
- Нулевое значение
- Корректную строку

Не нужно тестировать все возможные варианты, достаточно покрыть граничные случаи.

```js
describe("Input validation", () => {
  it("should reject empty string", () => {
    expect(() => validateTodoTitle("")).toThrow();
  });

  it("should reject null", () => {
    expect(() => validateTodoTitle(null)).toThrow();
  });

  it("should reject undefined", () => {
    expect(() => validateTodoTitle(undefined)).toThrow();
  });

  it("should reject very long strings", () => {
    const longString = "a".repeat(1000);
    expect(() => validateTodoTitle(longString)).toThrow();
  });

  it("should accept valid strings", () => {
    expect(validateTodoTitle("Valid todo title")).toBe(true);
  });

  it("should accept maximum length string", () => {
    const maxLengthString = "a".repeat(255);
    expect(validateTodoTitle(maxLengthString)).toBe(true);
  });
});
```

### Используйте Setup и Teardown

_Сетап (Setup)_ и _Тирдаун (Teardown)_ — это процессы подготовки и очистки окружения перед и после выполнения тестов. В Jest для этого используются функции `beforeAll`, `beforeEach`, `afterAll`, `afterEach`. Они полезны для настройки базы данных, очистки данных и других операций, которые должны выполняться до или после тестов.

```js
describe("Todo API with database", () => {
  let testTodoId;

  beforeAll(async () => {
    // Выполняется один раз перед всеми тестами
    await connectToTestDatabase();
  });

  beforeEach(async () => {
    // Выполняется перед каждым тестом
    testTodoId = await createTestTodo();
  });

  afterEach(async () => {
    // Выполняется после каждого теста
    await cleanupDatabase();
  });

  afterAll(async () => {
    // Выполняется один раз после всех тестов
    await disconnectFromDatabase();
  });

  it("should retrieve created todo", async () => {
    const res = await request(app).get(`/todos/${testTodoId}`);
    expect(res.status).toBe(200);
  });
});
```

### Тестируйте поведение, а не реализацию

_Тестируйте поведение, а не реализацию_ — это практика, которая рекомендует фокусироваться на том, что должен делать код, а не на том, как он это делает. Это помогает сделать тесты менее хрупкими и более устойчивыми к изменениям в коде.

```js
// Плохо - тестируем внутреннюю реализацию
it("should use array.filter internally", () => {
  const spy = jest.spyOn(Array.prototype, "filter");
  getTodosByStatus("completed");
  expect(spy).toHaveBeenCalled();
});

// Хорошо - тестируем поведение
it("should return only completed todos", async () => {
  const res = await request(app).get("/todos?status=completed");
  res.body.forEach((todo) => {
    expect(todo.completed).toBe(true);
  });
});
```

### Избегайте флаксных тестов

_Флаксные тесты (Flaky Tests)_ — это тесты, которые иногда проходят, а иногда падают без изменений в коде. Они создают недоверие к тестам и усложняют процесс разработки. Это может быть вызвано асинхронностью, зависимостью от внешних сервисов или неправильной настройкой окружения.

Чтобы избежать флаксных тестов:

- Используйте моки для внешних зависимостей
- Убедитесь, что тесты изолированы друг от друга
- Избегайте использования случайных данных
- Убедитесь, что асинхронный код правильно обрабатывается в тестах
- Регулярно пересматривайте и обновляйте тесты

```js
// Плохо - зависит от времени
it("should process todo quickly", async () => {
  const start = Date.now();
  await processTodo();
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(100); // Может быть слишком строго
});

// Хорошо - тестируем результат, не время
it("should process todo successfully", async () => {
  const result = await processTodo();
  expect(result).toHaveProperty("processedAt");
  expect(result.status).toBe("processed");
});
```

## Покрытие кода тестами (Code Coverage)

### Что такое покрытие?

_Покрытие кода (Code Coverage)_ — это метрики, которые показывают, какая часть вашего кода была выполнена во время запуска тестов. Она помогает определить, насколько хорошо ваши тесты покрывают функциональность приложения.

_Метрики_:

- _Statements_ — процент строк кода, которые были выполнены
- _Branches_ — процент условных ветвей (if/else)
- _Functions_ — процент функций, которые были вызваны
- _Lines_ — процент строк с кодом, которые были выполнены

### Создание отчёта о покрытии

В Jest создание отчёта о покрытии кода встроено. Чтобы сгенерировать отчёт, используйте команду:

```bash
npm run test:coverage
```

Jest создаст отчёт в консоли и папке `coverage/`, где вы сможете увидеть детальную информацию о покрытии кода.

### Установка минимума покрытия

Рекомендуется устанавливать минимальные пороги покрытия, чтобы гарантировать, что ваш код хорошо протестирован. В Jest это можно сделать, добавив следующие настройки в `package.json`:

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

Если покрытие ниже установленного порога, Jest вернёт ошибку.

## Документация тестов

### Важность документации тестов

Документация тестов важна для понимания того, что именно проверяется в каждом тесте, особенно когда проект развивается и к нему присоединяются новые разработчики. Хорошо документированные тесты облегчают поддержку и расширение тестового покрытия.

### Примеры хорошей документации

```js
/**
 * Test Suite: User Registration
 * Purpose: Verify that the user registration endpoint works correctly.
 * Dependencies: Express app, UserModel
 */
describe("User Registration", () => {
  /**
   * Test: POST /users/register
   * Purpose: Verify successful user registration with valid data
   * Expected Behavior:
   *  - Returns 201 Created
   *  - Response body contains user ID and username
   */
  it("should register a new user with valid data", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ username: "testuser", password: "password123" })
      .expect(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.username).toBe("testuser");
  });

  /**
   * Test: POST /users/register
   * Purpose: Verify error response when password is missing
   * Expected Behavior:
   *  - Returns 400 Bad Request
   *  - Response body contains error message
   */
  it("should return 400 if password is missing", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({ username: "testuser" })
      .expect(400);
    expect(response.body).toHaveProperty("error");
  });
});
```
