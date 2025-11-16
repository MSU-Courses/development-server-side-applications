# Архитектурные стили и протоколы взаимодействия в веб-API

## Содержание

- [Архитектурные стили и протоколы взаимодействия в веб-API](#архитектурные-стили-и-протоколы-взаимодействия-в-веб-api)
  - [Содержание](#содержание)
  - [Введение: Что такое веб-API](#введение-что-такое-веб-api)
    - [Зачем нужен веб-API](#зачем-нужен-веб-api)
    - [Архитектурные стили веб-API](#архитектурные-стили-веб-api)
  - [REST API](#rest-api)
    - [Определение REST](#определение-rest)
    - [Принципы REST архитектуры](#принципы-rest-архитектуры)
    - [Ресурсы и их представления](#ресурсы-и-их-представления)
    - [HTTP методы в REST](#http-методы-в-rest)
  - [Пример REST API для управления задачам](#пример-rest-api-для-управления-задачам)
    - [RESTful API](#restful-api)
  - [SOAP API](#soap-api)
    - [Определение SOAP](#определение-soap)
    - [Характеристики SOAP](#характеристики-soap)
    - [Структура SOAP сообщения](#структура-soap-сообщения)
    - [Пример SOAP API (создание задачи)](#пример-soap-api-создание-задачи)
      - [Получение всех задач](#получение-всех-задач)
      - [Получение одной задачи по ID](#получение-одной-задачи-по-id)
      - [Создание новой задачи](#создание-новой-задачи)
      - [Обработка ошибок (Fault)](#обработка-ошибок-fault)
  - [Преимущества и недостатки SOAP](#преимущества-и-недостатки-soap)
  - [GraphQL](#graphql)
    - [Определение GraphQL](#определение-graphql)
    - [Архитектура GraphQL](#архитектура-graphql)
    - [Пример GraphQL Schema и запросов для управления задачами](#пример-graphql-schema-и-запросов-для-управления-задачами)
    - [Реализация GraphQL API с использованием Express.js](#реализация-graphql-api-с-использованием-expressjs)
    - [Пример запросов GraphQL](#пример-запросов-graphql)
    - [Организация GraphQL проекта при множестве сущностей](#организация-graphql-проекта-при-множестве-сущностей)
    - [Основные характеристики GraphQL](#основные-характеристики-graphql)
    - [Преимущества и недостатки GraphQL](#преимущества-и-недостатки-graphql)
  - [WebSockets](#websockets)
    - [Определение WebSockets](#определение-websockets)
    - [Типы реализаций WebSockets](#типы-реализаций-websockets)
    - [Пример: Pure WebSocket с Express.js](#пример-pure-websocket-с-expressjs)
    - [Пример: Socket.IO с Express.js](#пример-socketio-с-expressjs)
    - [Комнаты и пространства имён в Socket.IO](#комнаты-и-пространства-имён-в-socketio)
  - [WebHooks](#webhooks)
    - [Определение WebHooks](#определение-webhooks)
    - [Webhook — по сути «обратный вызов с URL»](#webhook--по-сути-обратный-вызов-с-url)
    - [Пример использования WebHooks](#пример-использования-webhooks)
    - [Основные характеристики WebHook:](#основные-характеристики-webhook)
  - [Сравнение REST, SOAP, GraphQL, WebSockets и WebHooks](#сравнение-rest-soap-graphql-websockets-и-webhooks)
  - [Другие архитектурные стили и протоколы](#другие-архитектурные-стили-и-протоколы)

## Введение: Что такое веб-API

Прежде чем начать разговор об архитектурных стилях, давайте вспомним, что такое _API_ (Application Programming Interface — интерфейс прикладного программирования).

_API_ — это набор инструкций и протоколов, которые позволяют одной программе взаимодействовать с другой. Представьте, что у вас есть ресторан. Посетитель (клиент) не может пройти на кухню и готовить сам, он предоставляет свой заказ официанту, который передаёт его на кухню. _Официант_ — это, по сути, API: он определяет, как клиент может общаться с кухней.

В программировании существует множество типов API, например:

- _Web API_ — интерфейсы, работающие через интернет, используя веб-протоколы (например, HTTP, WebSockets).
- _OS API_ — интерфейсы, предоставляемые операционной системой для взаимодействия с её функциями (например, файловая система).

В этой лекции мы сосредоточимся на _веб-API_ — способах взаимодействия приложений через интернет.

### Зачем нужен веб-API

Веб-API позволяет:

- Разделить фронтенд и бэкенд, чтобы они могли разрабатываться независимо.
- Предоставить доступ к данным и функциональности сторонним приложениям.
- Создавать микросервисную архитектуру, где разные сервисы общаются между собой.
- Масштабировать приложение, позволяя различным компонентам работать на разных серверах.

Например, когда вы используете приложение _Instagram_ на своём смартфоне, это приложение постоянно общается с серверами _Instagram_ через веб-API. Когда вы загружаете ленту, вы отправляете запрос на API, который возвращает вам данные о постах.

### Архитектурные стили веб-API

_Архитектурный стиль_ в контексте веб-API — это набор соглашений, принципов и ограничений, которые определяют, как структурировать взаимодействие между клиентом и сервером.

Различные архитектурные стили по-разному решают задачи получения, обновления и удаления данных. Давайте рассмотрим наиболее популярные из них.

## REST API

### Определение REST

_REST_ (Representational State Transfer) — это архитектурный стиль для проектирования сетевых приложений, основанный на использовании стандартных HTTP методов и ресурсов. REST был предложен Роем Филдингом в его докторской диссертации в 2000 году и стал основой для большинства современных веб-сервисов [^1].

### Принципы REST архитектуры

REST основан на шести архитектурных принципах. Данные принципы были рассмотрены на курсе по основам веб-разработки, вспомним их кратко:

- _Клиент-сервер_. Клиент и сервер разделены. Клиент отправляет запросы, сервер обрабатывает их и отправляет ответы.
- _Безсостояность (Stateless)_. Каждый запрос содержит всю необходимую информацию для его обработки. Сервер не хранит информацию о предыдущих запросах клиента между запросами.
- _Кэшируемость_. Ответы сервера должны быть либо кэшируемыми, либо некэшируемыми. Это позволяет улучшить производительность и снизить нагрузку на сервер.
- _Единый интерфейс_. Все взаимодействие между клиентом и сервером должно следовать единообразным правилам (использование одинаковых URL структур, HTTP методов и т.д.).
- _Слоистая система_. API может состоять из нескольких слоёв (например, фронтенд, бизнес-логика, база данных), и клиент не должен знать, напрямую ли он обращается к конечному сервису.
- _Код по требованию (опционально)_. Сервер может расширять функциональность клиента, отправляя выполняемый код (например, JavaScript).

### Ресурсы и их представления

В REST всё представляется как _ресурс_.

_Ресурс_ — это сущность, которая имеет идентификатор и может быть представлена в различных форматах.

Например, в API для управления задачами (todo):

- Каждая задача (`Todo`) — это ресурс с уникальным идентификатором.
- Задача может быть представлена в формате JSON: `{ "id": 1, "title": "Купить молоко", "completed": false }`.
- Одна и та же задача может быть представлена в разных форматах (JSON, XML и т.д.), но это один и тот же ресурс.

### HTTP методы в REST

В REST используются стандартные HTTP методы для операций с ресурсами:

| Метод    | Назначение                   | Пример                | Описание                        |
| -------- | ---------------------------- | --------------------- | ------------------------------- |
| `GET`    | Получение множества ресурсов | `GET /api/todos`      | Получить все задачи             |
| `GET`    | Получение одного ресурса     | `GET /api/todos/1`    | Получить задачу с ID 1          |
| `POST`   | Создание ресурса             | `POST /api/todos`     | Создать новую задачу            |
| `PUT`    | Полное обновление ресурса    | `PUT /api/todos/1`    | Обновить задачу с ID 1          |
| `PATCH`  | Частичное обновление ресурса | `PATCH /api/todos/1`  | Частично обновить задачу с ID 1 |
| `DELETE` | Удаление ресурса             | `DELETE /api/todos/1` | Удалить задачу с ID 1           |

> Важно понимать разницу между PUT и PATCH:
>
> - `PUT` заменяет весь ресурс. Если вы отправите PUT запрос с неполными данными, отсутствующие поля будут удалены или установлены в значение по умолчанию.
> - `PATCH` обновляет только те поля, которые вы указали. Остальные поля остаются без изменений [^2].

## Пример REST API для управления задачам

В качестве примера рассмотрим простое REST API для управления задачами (todo list).

```js
const express = require('express');
const app = express();
app.use(express.json());

// Хранилище задач в памяти
let todos = [
  { id: 1, title: 'Купить молоко', completed: false },
  { id: 2, title: 'Написать код', completed: true },
];

// GET: Получить все задачи
app.get('/api/todos', (req, res) => {
  res.status(200).json(todos);
});

// GET: Получить одну задачу по ID
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }
  res.status(200).json(todo);
});

// POST: Создать новую задачу
app.post('/api/todos', (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'Название задачи обязательно' });
  }

  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
    title: req.body.title,
    completed: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT: Полностью обновить задачу
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  if (!req.body.title || req.body.completed === undefined) {
    return res.status(400).json({ error: 'Требуются title и completed' });
  }

  todo.title = req.body.title;
  todo.completed = req.body.completed;
  res.status(200).json(todo);
});

// PATCH: Частично обновить задачу
app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  if (req.body.title !== undefined) {
    todo.title = req.body.title;
  }
  if (req.body.completed !== undefined) {
    todo.completed = req.body.completed;
  }

  res.status(200).json(todo);
});

// DELETE: Удалить задачу
app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  const deletedTodo = todos.splice(index, 1);
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('Server запущен на http://localhost:3000');
});
```

### RESTful API

_RESTful API_ — это API, которое полностью соблюдает все принципы и ограничения REST архитектуры. Не все API, использующие HTTP и JSON, являются RESTful. Например, API может использовать HTTP, но нарушать принцип безсостояности, сохраняя информацию о клиентах на сервере.

## SOAP API

### Определение SOAP

_SOAP (Simple Object Access Protocol)_ — это протокол для обмена структурированной информацией, использующий XML для сериализации данных. SOAP был разработан Microsoft в конце 1990-х годов и был одним из первых стандартов для веб-сервисов [^3].

В отличии от REST, который является архитектурным стилем, SOAP — это протокол с чётко определёнными правилами и стандартами.

### Характеристики SOAP

- _Протокол, основанный на XML_. SOAP использует исключительно XML для форматирования сообщений.
- _Строгая структура_. SOAP сообщение имеет чёткую структуру: `Envelope`, `Header`, `Body`, `Fault`.
- _Поддержка различных транспортных протоколов_. SOAP может работать не только с HTTP, но и с SMTP, JMS и другими протоколами.
- _Встроенная система ошибок_. SOAP имеет стандартизированный способ обработки ошибок через `Fault` элементы.

### Структура SOAP сообщения

_SOAP сообщение_ — это XML документ с чёткой структурой, которая определяется спецификацией SOAP. Рассмотрим его на примере:

```xml
<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               soap:encodingStyle="http://www.w3.org/2003/05/soap-encoding">
  <soap:Header>
    <!-- Дополнительная информация, необязательный элемент -->
  </soap:Header>
  <soap:Body>
    <!-- Основное содержимое запроса/ответа -->
    <m:CreateTodo xmlns:m="http://api.example.com/todos">
      <m:title>Купить молоко</m:title>
    </m:CreateTodo>
  </soap:Body>
</soap:Envelope>
```

Каждое SOAP сообщение строится по определённым правилам:

- _XML декларация_. Любое SOAP сообщение начинается с `<?xml version="1.0"?>` — это обязательная декларация, которая указывает, что документ является XML-документом.
- _Корневой элемент `Envelope`_. Все содержимое SOAP сообщения должно быть заключено в элемент `<soap:Envelope>`. Этот элемент определяет пространство имён SOAP и указывает стиль кодирования данных.
- _Элемент `Header` (необязательный)_. Содержит метаданные и служебную информацию, которая не является частью основного содержимого. Это может быть информация об аутентификации, маршрутизации или другие контекстные данные.
  Пример с токеном безопасности:
  ```xml
  <soap:Header>
  <m:Security xmlns:m="http://api.example.com/security">
     <m:Token>abcdef123456</m:Token>
  </m:Security>
  </soap:Header>
  ```
- _Элемент `Body` (обязательный)_. Содержит основное содержимое запроса или ответа — вызовы методов, параметры, данные. В приведённом примере `Body` содержит вызов метода `CreateTodo` с параметром `title`.
  Каждый элемент внутри Body должен следовать определённым соглашениям:

  - Имена тегов должны быть осмысленными и отражать их назначение (например, `<m:title>` для названия задачи). Префикс `m:` указывает на пространство имён, которое определяет сущность этого тега.
  - Теги должны быть правильно вложены и закрыты, обеспечивая корректность XML структуры.
  - Каждый тег должен указывать пространство имён через атрибут `xmlns:m="http://api.example.com/todos"`.

- _Элемент `Fault` (для ошибок)_. Если при обработке запроса произойдёт ошибка, вместо обычного ответа сервер отправит ответ с элементом Fault внутри Body. Это стандартный способ SOAP передавать информацию об ошибках.
  Пример ответа об ошибке:

  ```xml
  <?xml version="1.0"?>
   <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
   <soap:Body>
      <soap:Fault>
         <soap:Code>
         <soap:Value>soap:Server</soap:Value>
         </soap:Code>
         <soap:Reason>
         <soap:Text>Ошибка при создании задачи</soap:Text>
         </soap:Reason>
      </soap:Fault>
   </soap:Body>
   </soap:Envelope>
  ```

### Пример SOAP API (создание задачи)

SOAP API для создания задачи может выглядеть следующим образом:

#### Получение всех задач

_Запрос клиента:_

```xml
POST /api/todos HTTP/1.1
Host: api.example.com
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <m:GetAllTodos xmlns:m="http://api.example.com/todos">
    </m:GetAllTodos>
  </soap:Body>
</soap:Envelope>
```

_Ответ сервера:_

```xml
HTTP/1.1 200 OK
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <m:GetAllTodosResponse xmlns:m="http://api.example.com/todos">
      <m:todos>
        <m:todo>
          <m:id>1</m:id>
          <m:title>Купить молоко</m:title>
          <m:completed>false</m:completed>
        </m:todo>
        <m:todo>
          <m:id>2</m:id>
          <m:title>Написать код</m:title>
          <m:completed>true</m:completed>
        </m:todo>
      </m:todos>
    </m:GetAllTodosResponse>
  </soap:Body>
</soap:Envelope>
```

#### Получение одной задачи по ID

_Запрос клиента:_

```xml
POST /api/todos HTTP/1.1
Host: api.example.com
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <m:GetTodo xmlns:m="http://api.example.com/todos">
      <m:id>1</m:id>
    </m:GetTodo>
  </soap:Body>
</soap:Envelope>
```

_Ответ сервера:_

```xml
HTTP/1.1 200 OK
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <m:GetTodoResponse xmlns:m="http://api.example.com/todos">
      <m:todo>
        <m:id>1</m:id>
        <m:title>Купить молоко</m:title>
        <m:completed>false</m:completed>
      </m:todo>
    </m:GetTodoResponse>
  </soap:Body>
</soap:Envelope>
```

#### Создание новой задачи

_Запрос клиента:_

```xml
POST /api/todos HTTP/1.1
Host: api.example.com
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <m:CreateTodo xmlns:m="http://api.example.com/todos">
      <m:title>Купить хлеб</m:title>
    </m:CreateTodo>
  </soap:Body>
</soap:Envelope>
```

_Ответ сервера:_

```xml
HTTP/1.1 201 Created
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <m:CreateTodoResponse xmlns:m="http://api.example.com/todos">
      <m:id>3</m:id>
      <m:title>Купить хлеб</m:title>
      <m:completed>false</m:completed>
    </m:CreateTodoResponse>
  </soap:Body>
</soap:Envelope>
```

#### Обработка ошибок (Fault)

Если при выполнении запроса произойдёт ошибка, сервер вернёт SOAP Fault. Рассмотрим ситуацию, когда клиент пытается получить задачу, которая не существует:

_Запрос клиента:_

```xml
POST /api/todos HTTP/1.1
Host: api.example.com
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <m:GetTodo xmlns:m="http://api.example.com/todos">
      <m:id>999</m:id>
    </m:GetTodo>
  </soap:Body>
</soap:Envelope>
```

_Ответ сервера (ошибка — статус 404):_

```xml
HTTP/1.1 404 Not Found
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <soap:Fault>
      <soap:Code>
        <soap:Value>soap:Server</soap:Value>
      </soap:Code>
      <soap:Reason>
        <soap:Text>Задача с ID 999 не найдена</soap:Text>
      </soap:Reason>
      <soap:Detail>
        <m:ErrorDetail xmlns:m="http://api.example.com/todos">
          <m:ErrorCode>TASK_NOT_FOUND</m:ErrorCode>
          <m:ErrorMessage>Запрашиваемый ресурс отсутствует в базе данных</m:ErrorMessage>
        </m:ErrorDetail>
      </soap:Detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>
```

## Преимущества и недостатки SOAP

| Преимущества                                             | Недостатки                                  |
| -------------------------------------------------------- | ------------------------------------------- |
| Строгая типизация и структура                            | Сложность и многословность (много XML кода) |
| Встроенная система ошибок                                | Медленнее, чем REST (больше данных)         |
| Хорошо подходит для enterprise решений                   | Сложно тестировать и отлаживать             |
| Поддержка различных протоколов                           | Нужны специальные инструменты для работы    |
| WSDL (Web Service Description Language) для документации | Меньше поддержки в современных фреймворках  |

Сегодня SOAP используется в основном в крупных корпоративных системах, где требуется высокая надежность и типизация. В новых проектах обычно выбирают REST и другие современные подходы.

## GraphQL

### Определение GraphQL

_GraphQL (Graph Query Language)_ — это язык запросов и среда выполнения для API, которая позволяет клиентам запрашивать _ровно те данные, которые им нужны_, не больше и не меньше [^4]. GraphQL был разработан компанией Facebook в 2012 году и открыт в 2015 году. На сегодняшний день он является одной из самых перспективных альтернатив REST.

### Архитектура GraphQL

GraphQL построен на трёх основных компонентах:

- _Schema (схема)_ — описание типов данных и доступных операций. Схема определяет, какие данные могут быть запрошены и какие операции можно выполнять. Например: `todos`, `users`.
- _Query_ — запросы для чтения данных. Клиент отправляет точный запрос того, какие поля данных ему нужны. Например, запрос только названия задач.
- _Mutation_ — запросы для изменения данных (создание, обновление, удаление).

### Пример GraphQL Schema и запросов для управления задачами

GraphQL требует предварительного определения схемы (schema), которая описывает все доступные типы данных, запросы и операции. Рассмотрим полный пример для API управления задачами.

_Схема в GraphQL_ — это контракт между клиентом и сервером, который указывает, какие данные можно запрашивать и как их структурировать. Вот пример схемы для управления задачами:

```graphql
type Todo {
  id: ID!
  title: String!
  completed: Boolean!
}

type Query {
  todos: [Todo!]!
  todo(id: ID!): Todo
}

type Mutation {
  createTodo(title: String!): Todo!
  updateTodo(id: ID!, title: String, completed: Boolean): Todo
  deleteTodo(id: ID!): Boolean!
}
```

Разбор элементов схемы:

_Тип данных Todo_. Определяет структуру объекта задачи с тремя полями:

- `id: ID!` — уникальный идентификатор задачи. Тип ID используется для идентификаторов, а восклицательный знак `!` означает, что это поле обязательное (не может быть `null`).
- `title: String!` — название задачи, также обязательное строковое поле.
- `completed: Boolean!` — флаг, указывающий, выполнена ли задача.

_Тип Query_. Определяет доступные запросы для чтения данных:

- `todos: [Todo!]!` — запрос возвращает массив задач (`[...]`), где каждый элемент обязательно является объектом типа Todo (первый `!`), и сам массив также не может быть `null` (второй `!`).
- `todo(id: ID!): Todo` — запрос принимает обязательный параметр `id` типа `ID` и возвращает одну задачу. Возвращаемое значение может быть `null`, если задача не найдена (нет `!` после `Todo`).

_Тип Mutation_. Определяет доступные операции для изменения данных:

- `createTodo(title: String!): Todo!` — создаёт новую задачу, принимая обязательный параметр `title` и возвращая созданный объект `Todo`.
- `updateTodo(id: ID!, title: String, completed: Boolean): Todo` — обновляет существующую задачу. Параметры `title` и `completed` необязательны (отсутствует `!`), что позволяет обновлять задачу частично.
- `deleteTodo(id: ID!): Boolean!` — удаляет задачу по ID и возвращает булево значение, указывающее на успех операции.

> Восклицательный знак `!` в GraphQL называется _non-null модификатор_. Он гарантирует, что поле или параметр всегда будет иметь значение и никогда не будет null. Это помогает предотвратить ошибки на клиентской стороне.

### Реализация GraphQL API с использованием Express.js

Реализуем вышеописанную схему GraphQL с использованием `Express.js` и `express-graphql`.

> Для реализации GraphQL API используем следующие пакеты:
>
> - @appollo/server - это современный пакет для создания GraphQL серверов.
> - @apollo/server/express4 - интеграция Apollo Server с Express.js.

```js
const express = require('express');
const { ApolloServer, gql } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const app = express();
app.use(express.json());

// Хранилище задач
let todos = [
  { id: '1', title: 'Купить молоко', completed: false },
  { id: '2', title: 'Написать код', completed: true },
];
let nextId = 3;

// Определяем schema
const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!): Todo!
    updateTodo(id: ID!, title: String, completed: Boolean): Todo
    deleteTodo(id: ID!): Boolean!
  }
`;

// Определяем resolvers (обработчики)
const resolvers = {
  Query: {
    todos: () => todos,
    todo: (_, { id }) => todos.find((t) => t.id === id),
  },
  Mutation: {
    createTodo: (_, { title }) => {
      const newTodo = {
        id: String(nextId++),
        title,
        completed: false,
      };
      todos.push(newTodo);
      return newTodo;
    },
    updateTodo: (_, { id, title, completed }) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return null;
      if (title !== undefined) todo.title = title;
      if (completed !== undefined) todo.completed = completed;
      return todo;
    },
    deleteTodo: (_, { id }) => {
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) return false;
      todos.splice(index, 1);
      return true;
    },
  },
};

// Создаём Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Запускаем сервер
async function start() {
  await server.start();
  app.use('/graphql', expressMiddleware(server));

  app.listen(3000, () => {
    console.log('GraphQL сервер запущен на http://localhost:3000/graphql');
  });
}

start();
```

### Пример запросов GraphQL

_Получение всех задач_

```graphql
query {
  todos {
    id
    title
    completed
  }
}
```

_Получить одну задачу:_

```graphql
query {
  todo(id: "1") {
    title
    completed
  }
}
```

_Создать новую задачу:_

```graphql
mutation {
  createTodo(title: "Купить хлеб") {
    id
    title
    completed
  }
}
```

_Обновить задачу:_

```graphql
mutation {
  updateTodo(id: "1", completed: true) {
    id
    title
    completed
  }
}
```

### Организация GraphQL проекта при множестве сущностей

По мере роста приложения GraphQL схема и резолверы могут стать очень большими. Лучший способ — разделить их по отдельным файлам в зависимости от сущностей. Например, для управления задачами и пользователями можно создать следующую структуру:

```
project/
├── server.js
├── graphql/
│   ├── schema/
│   │   ├── index.js
│   │   ├── todo.graphql
│   │   ├── user.graphql
│   │   └── comment.graphql
│   └── resolvers/
│       ├── index.js
│       ├── todoResolvers.js
│       ├── userResolvers.js
│       └── commentResolvers.js
├── models/
│   ├── todoModel.js
│   ├── userModel.js
│   └── commentModel.js
└── package.json
```

Пример реализации одной из сущностей (`todo`):

_Файл: graphql/schema/index.js_

```js
const fs = require('fs');
const path = require('path');
const { gql } = require('@apollo/server');

// Читаем все .graphql файлы из папки schema
const baseTypeDefs = gql`
  type Query
  type Mutation
`;

const todoSchema = fs.readFileSync(path.join(__dirname, 'todo.graphql'), 'utf8');
const userSchema = fs.readFileSync(path.join(__dirname, 'user.graphql'), 'utf8');
const commentSchema = fs.readFileSync(path.join(__dirname, 'comment.graphql'), 'utf8');

const typeDefs = gql`
  ${baseTypeDefs}
  ${todoSchema}
  ${userSchema}
  ${commentSchema}
`;

module.exports = typeDefs;
```

_Файл: graphql/schema/todo.graphql_

```graphql
type Todo {
  id: ID!
  title: String!
  completed: Boolean!
  userId: ID!
  createdAt: String!
}

extend type Query {
  todos: [Todo!]!
  todo(id: ID!): Todo
  userTodos(userId: ID!): [Todo!]!
}

extend type Mutation {
  createTodo(title: String!, userId: ID!): Todo!
  updateTodo(id: ID!, title: String, completed: Boolean): Todo
  deleteTodo(id: ID!): Boolean!
}
```

_Файл: graphql/resolvers/index.js_

```js
const todoResolvers = require('./todoResolvers');
const userResolvers = require('./userResolvers');
const commentResolvers = require('./commentResolvers');

// Объединяем все резолверы
const resolvers = {
  Query: {
    ...todoResolvers.Query,
    ...userResolvers.Query,
    ...commentResolvers.Query,
  },
  Mutation: {
    ...todoResolvers.Mutation,
    ...userResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
  Todo: todoResolvers.Todo,
  User: userResolvers.User,
  Comment: commentResolvers.Comment,
};

module.exports = resolvers;
```

_Файл: models/todoModel.js_

```js
import todoData from '../data/todos.json' assert { type: 'json' };

// Пример модели задачи (можно использовать с базой данных)
export function createTodo(title, userId) {
  const newTodo = {
    id: String(todoData.length + 1),
    title,
    completed: false,
    userId,
    createdAt: new Date().toISOString(),
  };
  todoData.push(newTodo);
  return newTodo;
}

export function getTodos() {
  return todoData;
}

export function getTodoById(id) {
  return todoData.find((t) => t.id === id);
}

export function updateTodo(id, title, completed) {
  const todo = getTodoById(id);
  if (!todo) return null;
  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;
  return todo;
}

// ...
```

_Файл: graphql/resolvers/todoResolvers.js_

```js
const { createTodo, getTodos, getTodoById, updateTodo } = require('../../models/todoModel');

const todoResolvers = {
  Query: {
    todos: () => getTodos(),
    todo: (_, { id }) => getTodoById(id),
  },
  Mutation: {
    createTodo: (_, { title, userId }) => createTodo(title, userId),
    updateTodo: (_, { id, title, completed }) => updateTodo(id, title, completed),
    deleteTodo: (_, { id }) => deleteTodo(id),
  },
};
```

_Файл: server.js_

```js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
app.use(express.json());

const server = new ApolloServer({ typeDefs, resolvers });

async function start() {
  await server.start();
  app.use('/graphql', expressMiddleware(server));

  app.listen(3000, () => {
    console.log('GraphQL сервер запущен на http://localhost:3000/graphql');
  });
}

start();
```

### Основные характеристики GraphQL

- _Гибкость запросов_. Клиент запрашивает только нужные ему поля, избегая over-fetching (получения лишних данных).
- _Типизация_. GraphQL имеет строгую систему типов, что помогает предотвратить ошибки.
- _Единая точка доступа_. В GraphQL есть один endpoint (обычно `/graphql`), а не множество как в REST.
- _Отсутствие проблем с версионированием_. GraphQL позволяет добавлять новые поля и типы без создания новых версий API.

### Преимущества и недостатки GraphQL

| Преимущества                                                    | Недостатки                                |
| --------------------------------------------------------------- | ----------------------------------------- |
| Клиент получает ровно то, что запросил (no over/under-fetching) | Сложнее для простых API                   |
| Единый endpoint для всех запросов                               | Требует обучения нового синтаксиса        |
| Сильная типизация                                               | Может быть медленнее при сложных запросах |
| Встроенная документация                                         | Более сложная в реализации                |

## WebSockets

### Определение WebSockets

_WebSocket_ — это протокол, который позволяет установить постоянное двусторонее соединение между клиентом и сервером. В отличие от HTTP, где клиент инициирует запрос, а сервер отвечает, WebSocket позволяет серверу отправлять данные клиенту в любой момент без явного запроса [^5].

Когда вам нужна реал-тайм (real-time) коммуникация, HTTP становится неэффективным. Представьте чат-приложение: если использовать обычные HTTP запросы, клиент должен постоянно спрашивать сервер "_есть ли новые сообщения?_", что создаёт большую нагрузку. С WebSockets сервер может мгновенно отправить новое сообщение клиенту, как только оно поступит.

_Когда использовать WebSockets:_

- Чаты и мессенджеры в реал-тайм
- Совместное редактирование документов (Google Docs)
- Игры в реал-тайм
- Финансовые приложения с обновлением котировок в реал-тайм
- Мониторинг и уведомления

### Типы реализаций WebSockets

Существует два основных подхода:

- _Pure WebSockets_ — использование чистого _WebSocket_ (ws) протокола. Это быстро и эффективно, но может иметь проблемы с некоторыми старыми браузерами и сетевыми фильтрами.
- _WebSocket over HTTP_ (например, _Socket.IO_) — библиотека, которая использует WebSockets, но с fallback механизмом на HTTP polling, если WebSocket недоступен. HTTP polling — это способ, при котором браузер каждые несколько секунд отправляет запрос серверу со словами "_есть ли для меня новые сообщения?_". Это менее эффективно, чем WebSocket (создаётся больше трафика), но это работает везде, где работает обычный HTTP. Библиотека _Socket.IO_ автоматически выбирает лучший доступный метод связи между клиентом и сервером, обеспечивая надёжность и совместимость.

### Пример: Pure WebSocket с Express.js

_Установка необходимых пакетов_

```bash
npm install express ws
```

_Файл: server.js_

```js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Создаём WebSocket сервер
const wss = new WebSocket.Server({ server });

// Обработчик подключения клиента
wss.on('connection', (ws) => {
  console.log('Клиент подключился');

  // Обработчик получения сообщения
  ws.on('message', (message) => {
    console.log(`Получено: ${message}`);

    // Отправляем сообщение всем подключённым клиентам
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Сервер получил: ${message}`);
      }
    });
  });

  // Обработчик отключения клиента
  ws.on('close', () => {
    console.log('Клиент отключился');
  });

  // Отправляем приветственное сообщение
  ws.send('Добро пожаловать на WebSocket сервер!');
});

// Статический HTML файл
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(3000, () => {
  console.log('WebSocket сервер запущен на http://localhost:3000');
});
```

_Файл: index.html_

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebSocket Example</title>
  </head>
  <body>
    <h1>WebSocket Example</h1>
    <input id="messageInput" type="text" placeholder="Введите сообщение" />
    <button id="sendButton">Отправить</button>
    <ul id="messages"></ul>
    <script>
      const ws = new WebSocket('ws://localhost:3000');

      // onopen событие вызывается, когда соединение установлено
      ws.onopen = () => {
        console.log('Соединение установлено');
      };

      // onmessage событие вызывается при получении сообщения от сервера
      ws.onmessage = (event) => {
        const messagesList = document.getElementById('messages');
        const newMessage = document.createElement('li');
        newMessage.textContent = event.data;
        messagesList.appendChild(newMessage);
      };

      document.getElementById('sendButton').onclick = () => {
        const input = document.getElementById('messageInput');
        ws.send(input.value);
        input.value = '';
      };
    </script>
  </body>
</html>
```

### Пример: Socket.IO с Express.js

Socket.IO более простая и надёжная в использовании. Установим пакет:

```bash
npm install express socket.io
```

_Файл: server.js_

```js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Хранилище для задач
let todos = [
  { id: 1, title: 'Купить молоко', completed: false },
  { id: 2, title: 'Написать код', completed: true },
];

app.use(express.static('public'));

// Обработчик подключения клиента
io.on('connection', (socket) => {
  console.log('Клиент подключился:', socket.id);

  // Отправляем все задачи при подключении
  socket.emit('todos:list', todos);

  // Обработчик создания новой задачи
  socket.on('todo:create', (data) => {
    const newTodo = {
      id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
      title: data.title,
      completed: false,
    };
    todos.push(newTodo);

    // Отправляем обновление всем подключённым клиентам
    io.emit('todos:list', todos);
  });

  // Обработчик обновления статуса задачи
  socket.on('todo:update', (data) => {
    const todo = todos.find((t) => t.id === data.id);
    if (todo) {
      todo.completed = data.completed;
      io.emit('todos:list', todos);
    }
  });

  // Обработчик удаления задачи
  socket.on('todo:delete', (data) => {
    todos = todos.filter((t) => t.id !== data.id);
    io.emit('todos:list', todos);
  });

  // Обработчик отключения
  socket.on('disconnect', () => {
    console.log('Клиент отключился:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO сервер запущен на http://localhost:3000');
});
```

_Клиентский код (public/index.html):_

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Todo App with Socket.IO</title>
    <script src="/socket.io/socket.io.js"></script>
  </head>
  <body>
    <h1>Todo List (Real-time)</h1>
    <input type="text" id="todoInput" placeholder="Добавить задачу" />
    <button onclick="addTodo()">Добавить</button>
    <ul id="todoList"></ul>

    <script>
      const socket = io();

      // on - подписка на событие
      socket.on('todos:list', (todos) => {
        const list = document.getElementById('todoList');
        list.innerHTML = '';
        todos.forEach((todo) => {
          const li = document.createElement('li');
          li.innerHTML = `
            ${todo.title}
            <input type="checkbox" ${todo.completed ? 'checked' : ''}
              onchange="updateTodo(${todo.id}, this.checked)">
            <button onclick="deleteTodo(${todo.id})">Удалить</button>
          `;
          list.appendChild(li);
        });
      });

      function addTodo() {
        const input = document.getElementById('todoInput');
        if (input.value) {
          // emit - отправка события на сервер
          socket.emit('todo:create', { title: input.value });
          input.value = '';
        }
      }

      function updateTodo(id, completed) {
        socket.emit('todo:update', { id, completed });
      }

      function deleteTodo(id) {
        socket.emit('todo:delete', { id });
      }
    </script>
  </body>
</html>
```

### Комнаты и пространства имён в Socket.IO

При работе с реал-тайм приложениями часто нужно отправлять сообщения только определённым пользователям, а не всем подряд. Например, в чате с несколькими комнатами сообщение из комнаты "_Спорт_" не должно попадать в комнату "_Кино_". Socket.IO предоставляет два инструмента для этого: комнаты (`rooms`) и пространства имён (`namespaces`).

_Комната_ — это способ группировки сокетов (подключённых клиентов). Когда вы отправляете сообщение в комнату, получат его только те клиенты, которые присоединились к этой комнате.

_Пространство имён (namespace)_ — это более высокоуровневое разделение. Это как отдельный канал со своей собственной логикой. Например, у вас может быть пространство `/chat` для сообщений чата и `/notifications` для уведомлений.

[Пример приложения-чата с комнатами и пространствами имён](../_samples/06_Sockets/)

## WebHooks

### Определение WebHooks

_WebHook_ — это способ отправки данных от одного приложения к другому через HTTP запрос. В отличие от REST API, где клиент постоянно запрашивает данные у сервера, WebHook позволяет серверу отправить данные клиенту, когда происходит определённое событие. Если _REST API — это "тяни" (pull)_, то _WebHook — это "толкай" (push)_.

Можно представить это через ситуацию с погодой. Представь, что ты хочешь узнавать о её изменениях от своего друга.

В модели _REST API_ ты сам постоянно звонишь другу и спрашиваешь: «Ну что, погода изменилась?». Ты продолжаешь звонить снова и снова, даже если друг ещё ничего не знает или ему нечего сказать.

В модели _WebHook_ ты говоришь другу заранее: «Когда погода изменится — просто сообщи мне. _Вот мой номер телефона_». И всё — друг позвонит тебе только тогда, когда действительно появится новая информация.

### Webhook — по сути «обратный вызов с URL»

Ты даёшь системе специальный URL (например, https://myserver.com/webhooks/weather) и говоришь: «Если у меня будет новый прогноз погоды, отправь его на этот URL». Когда прогноз меняется, система автоматически отправляет HTTP POST запрос на указанный URL с данными о новом прогнозе.

### Пример использования WebHooks

Представьте интеграцию платёжной системы (например, `Stripe`) с вашим приложением:

1. Пользователь совершает покупку в вашем приложении.
2. Ваше приложение отправляет запрос на обработку платежа в Stripe.
3. `Stripe` обрабатывает платёж.
4. Вместо того, чтобы ваше приложение постоянно проверяло статус платежа, `Stripe` отправляет `WebHook` с информацией о результате платежа на ваш сервер.
5. Ваше приложение получает WebHook и обновляет статус заказа.

### Основные характеристики WebHook:

- _Событийно-ориентированные_. WebHook отправляется только когда происходит определённое событие.
- _Односторонние уведомления_. Сервер отправляет данные клиенту, клиент не отправляет запрос.
- _Асинхронные_. Отправка WebHook не блокирует основной процесс.
- _URL endpoint_. Клиент предоставляет URL, на который будут отправляться WebHooks.

> В таком формате к одному сервису можно подключить множество клиентов, каждый из которых будет получать уведомления о событиях.

## Сравнение REST, SOAP, GraphQL, WebSockets и WebHooks

| Характеристика        | REST                          | SOAP                 | GraphQL            | WebSockets       | WebHooks                            |
| --------------------- | ----------------------------- | -------------------- | ------------------ | ---------------- | ----------------------------------- |
| _Тип_                 | Архитектурный стиль           | Протокол             | Query язык         | Протокол         | Событийный паттерн                  |
| _Формат данных_       | JSON, XML                     | XML                  | JSON               | JSON/бинарный    | JSON                                |
| _Endpoints_           | Множество                     | Один                 | Один               | Один             | Динамические (предоставляет клиент) |
| _HTTP методы_         | GET, POST, PUT, DELETE, PATCH | Только POST          | Только POST        | Нет HTTP         | Только POST                         |
| _Over-fetching_       | Возможно                      | Редко                | Невозможно         | N/A              | N/A                                 |
| _Under-fetching_      | Возможно                      | Редко                | Невозможно         | N/A              | N/A                                 |
| _Кэширование_         | Легко                         | Сложно               | Сложно             | N/A              | N/A                                 |
| _Безсостояность_      | Да                            | Да                   | Да                 | Нет (соединение) | Да                                  |
| _Реал-тайм_           | Нет (polling)                 | Нет                  | Подписки           | Да               | Нет                                 |
| _Сложность_           | Низкая                        | Высокая              | Средняя            | Средняя          | Средняя                             |
| _Версионирование_     | Требуется                     | WSDL версионирование | Не требуется       | N/A              | N/A                                 |
| _Скорость разработки_ | Быстрая                       | Медленная            | Средняя            | Средняя          | Средняя                             |
| _Использование_       | Публичные API                 | Enterprise           | Сложные приложения | Чаты, игры       | Интеграции                          |

## Другие архитектурные стили и протоколы

В этой лекции мы сосредоточились на наиболее популярных архитектурных стилях для веб-API. Однако существуют и другие подходы, которые обычно используются для микросервисной архитектуры и межсерверного взаимодействия, которые будут рассмотрены в следующих лекциях/курсах.

- _gRPC_ — высокопроизводительный RPC фреймворк от Google, использующий Protocol Buffers.
- _Message Queues (RabbitMQ, Kafka)_ — асинхронная доставка сообщений.
- _Apache Thrift_ — фреймворк для разработки сервисов с кроссплатформенной совместимостью.

[^1]: Roy Thomas Fielding. _Architectural Styles and the Design of Network-based Software Architectures_. Doctoral dissertation, University of California, Irvine, 2000. [online] Available at: https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm 
[^2]: _HTTP PATCH Method_. IETF RFC 5789. [online] Available at: https://tools.ietf.org/html/rfc5789 
[^3]: _SOAP: Simple Object Access Protocol_. W3C Recommendation. [online] Available at: https://www.w3.org/TR/soap12/ 
[^4]: _GraphQL Specification_. [online] Available at: https://spec.graphql.org/ 
[^5]: _The WebSocket Protocol_. IETF RFC 6455. [online] Available at: https://tools.ietf.org/html/rfc6455 
