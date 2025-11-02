# Продвинутая архитектура бэкенд-сервисов

## Введение

По мере роста приложения код начинает становиться все более сложным и запутанным. Простая структура, которая отлично работала на начальных этапах, превращается в "спагетти-код", который трудно поддерживать и расширять. В этой лекции мы рассмотрим, как правильно архитектурно организовать бэкенд-сервис, чтобы он оставался понятным, масштабируемым и легко тестируемым.

Представьте, что вы строите дом. Если вы просто начнете складывать кирпичи без плана, возможно, у вас получится какая-то структура, но она будет ненадежной и непрактичной. То же самое происходит с кодом - без правильной архитектуры ваше приложение быстро станет немасштабируемым и трудным в поддержке.

## Что такое бизнес-логика и предметная область?

Перед изучением архитектурных паттернов важно понять, что такое бизнес-логика и предметная область (domain).

_Бизнес-логика_ — это правила и процессы, которые определяют, как приложение выполняет свои задачи в рамках специфической области.

_Предметная область_ — это область знаний, для которой создаётся приложение. Например:

- Для интернет-магазина — продажа товаров.
- Для банковского приложения — управление счетами и транзакциями.
- Для социальной сети — взаимодействие между пользователями.

Бизнес-логика определяет, что делает приложение. Она не касается технических аспектов, таких как обработка HTTP-запросов или работа с интерфейсом.

## Проблема "грязного" кода и мотивация архитектурного разделения

Когда приложение только начинается, разработчики часто пишут весь код в одном месте. Например, контроллер может содержать всю логику - валидацию данных, обращение к базе данных, отправку email-уведомлений и формирование HTTP-ответа. Это называется _тесной связанностью_ (tight coupling).

```js
// Пример "грязного" контроллера
app.post('/users', async (req, res) => {
  // Валидация
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Прямое обращение к базе данных
  const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [req.body.email]);
  if (existingUser.length > 0) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Бизнес-логика
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  // Сохранение в базу
  const result = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [
    req.body.email,
    hashedPassword,
  ]);

  // Отправка email
  await sendEmail(req.body.email, 'Welcome!', 'Thank you for registering');

  // HTTP ответ
  res.status(201).json({ id: result.insertId, email: req.body.email });
});
```

Проблемы такого подхода:

- _Сложность тестирования_. Нельзя протестировать бизнес-логику отдельно от HTTP-запросов и базы данных.
- _Дублирование кода_. Если нужно создать пользователя в другом месте приложения, придется копировать весь этот код.
- _Сложность изменения_. Изменение способа хранения данных потребует изменений во всех контроллерах.
- _Нарушение единой ответственности_. Контроллер делает слишком много разных вещей.

## Принципы SOLID

_SOLID_ - это набор из пяти принципов объектно-ориентированного проектирования, предложенных Робертом Мартином (Uncle Bob). Эти принципы помогают создавать понятный, гибкий и поддерживаемый код. Вы рассматривали данные прицнипы на предыдущих этапах обучения, но в контексте данной лекции мы вкратце их рассмотрим, так как они лежат в основе архитектурных решений.

### S - Single Responsibility Principle (Принцип единственной ответственности)

Каждый модуль, класс или функция должны иметь только одну причину для изменения. Другими словами, каждая часть кода должна отвечать только за одну конкретную задачу.

_Пример нарушения принципа_:

```js
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  // Сохранение в базу данных
  save() {
    db.query('INSERT INTO users...');
  }

  // Отправка email
  sendWelcomeEmail() {
    sendEmail(this.email, 'Welcome!');
  }

  // Валидация
  validate() {
    if (!this.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

Исправленная версия:

```js
// Хорошо: каждый класс имеет одну ответственность
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class UserRepository {
  save(user) {
    db.query('INSERT INTO users...');
  }
}

class EmailService {
  sendWelcomeEmail(email) {
    sendEmail(email, 'Welcome!');
  }
}

class UserValidator {
  validate(user) {
    if (!user.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

Теперь каждый класс отвечает за одну конкретную задачу:

- `User` - модель пользователя.
- `UserRepository` - работа с базой данных.
- `EmailService` - отправка email.
- `UserValidator` - валидация данных пользователя.

### O - Open/Closed Principle (Принцип открытости/закрытости)

Программные сущности должны быть открыты для расширения, но закрыты для модификации. Это означает, что мы можем добавлять новую функциональность без изменения существующего кода.

```js
// Плохо: для добавления нового способа оплаты нужно менять класс
class PaymentProcessor {
  processPayment(type, amount) {
    if (type === 'paypal') {
      // PayPal логика
    } else if (type === 'stripe') {
      // Stripe логика
    }
    // Для добавления нового способа нужно менять этот класс
  }
}

// Хорошо: можно расширять, не меняя существующий код
class PaymentProcessor {
  constructor(paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  process(amount) {
    return this.paymentMethod.pay(amount);
  }
}

class PayPalPayment {
  pay(amount) {
    // PayPal логика
  }
}

class StripePayment {
  pay(amount) {
    // Stripe логика
  }
}
```

Теперь для добавления нового способа оплаты достаточно создать новый класс, реализующий метод `pay`, не изменяя `PaymentProcessor`.

### L - Liskov Substitution Principle (Принцип подстановки Барбары Лисков)

Один из самых трудных для понимания принципов. Он гласит, что объекты в программе должны быть заменяемы на экземпляры их подтипов без изменения правильности выполнения программы.

То есть, простыми словами, если у нас есть базовый класс и его подклассы, мы должны иметь возможность использовать подклассы вместо базового класса без нарушения логики программы.

```js
class Bird {
  fly() {
    console.log('Flying');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Penguins can't fly");
  }
}

function letBirdFly(bird) {
  bird.fly();
}
```

В этом примере `Penguin` нарушает принцип Лисков, так как он не может летать, хотя является птицей. Чтобы исправить это, можно создать отдельный интерфейс для летающих птиц.

```js
class Bird {
  eat() {
    console.log('Eating');
  }
}

class FlyingBird extends Bird {
  fly() {
    console.log('Flying');
  }
}

class Penguin extends Bird {
  // Пингвин не летает, но ест
}

function letBirdEat(bird) {
  bird.eat();
}
```

Рассмотрим более реальный пример с скидками:

```js
class User {
  getDiscount() {
    return 0.05; // 5% скидка
  }
}

// Нарушение Liskov: GuestUser меняет логику, неожиданно выбрасывает ошибку!
class GuestUser extends User {
  getDiscount() {
    throw new Error('Guests do not have discounts');
  }
}

function printDiscount(user) {
  console.log(`Ваша скидка: ${user.getDiscount() * 100}%`);
}

// Использование
const users = [new User(), new GuestUser()];

users.forEach(printDiscount); // User OK, GuestUser ломает flow!
```

Правильнее будет возвращать корректное значение без ошибки, чтобы и GuestUser соответствовал ожиданиям базового класса:

```js
class User {
  getDiscount() {
    return 0.05; // 5%
  }
}

class GuestUser extends User {
  getDiscount() {
    return 0; // Гости не получают скидку, но метод всё равно возвращает число
  }
}

function printDiscount(user) {
  console.log(`Ваша скидка: ${user.getDiscount() * 100}%`);
}

// Теперь универсальный код работает с любым наследником User
const users = [new User(), new GuestUser()];
users.forEach(printDiscount); // Выведет 5%, 0%
```

Так любой `User`, включая `GuestUser`, ведёт себя прогнозируемо. Никакой код, использующий базовый интерфейс, не "ломается" на потомках.

### I - Interface Segregation Principle (Принцип разделения интерфейса)

Клиенты не должны зависеть от интерфейсов, которые они не используют. Лучше иметь несколько специализированных интерфейсов, чем один универсальный. В контексте JS сложно говорить об интерфейсах в классическом смысле, но идея остаётся той же: не заставляйте классы реализовывать методы, которые им не нужны.

```js
// Плохо: один интерфейс для всех
class MultiFunctionDevice {
  print() {
    // Печать
  }
  scan() {
    // Сканирование
  }
  fax() {
    // Факс
  }
}

// Хорошо: разделение на специализированные интерфейсы
class Printer {
  print() {
    // Печать
  }
}

class Scanner {
  scan() {
    // Сканирование
  }
}

class Fax {
  fax() {
    // Факс
  }
}
```

### D - Dependency Inversion Principle (Принцип инверсии зависимостей)

Модули верхнего уровня не должны зависеть от модулей нижнего уровня. Оба должны зависеть от абстракций. Абстракции не должны зависеть от деталей. Детали должны зависеть от абстракций.

Простыми словами, вместо того чтобы создавать конкретные зависимости внутри класса, лучше передавать их извне (например, через конструктор). Это облегчает тестирование и изменение зависимостей.

## Многослойная архитектура (Layered Architecture)

Выше были рассмотрены проблемы "грязного" кода и принципы SOLID, которые помогают их решать. Один из самых часто нарушаемых принципов — это принцип единственной ответственности (SRP). Чтобы лучше следовать этому принципу, часто рекомендуется разделять код на слои, каждый из которых отвечает за свою часть функциональности.

В предыдущих лекциях были рассмотрены базовые слои:

- _Контроллер (Controller)_. Отвечает за обработку HTTP-запросов и формирование ответов.
- _Модель (Model)_. Отвечает за взаимодействие с базой данных.
- _Представление (View)_. Отвечает за отображение данных пользователю (чаще в веб-приложениях).

Однако для более сложных приложений часто требуется более детальное разделение, чтобы лучше изолировать бизнес-логику от технических деталей.

### Controller Layer (Слой контроллеров)

Слой контроллеров был рассмотрен ранее. _Контроллеры отвечают за обработку HTTP-запросов и формирование HTTP-ответов_. Это точка входа в приложение. Это должна быть их единственная ответственность.

_Ответственность контроллера_:

- Парсинг и валидация входящих данных из запроса (query parameters, body, headers).
- Вызов соответствующих методов сервисного слоя.
- Преобразование результата работы сервиса в HTTP-ответ (JSON, XML, HTML).
- Установка правильных HTTP-статусов и заголовков.

_Что контроллер НЕ должен делать_:

- Содержать бизнес-логику.
- Напрямую обращаться к базе данных.
- Содержать сложные вычисления.

### Service Layer (Слой сервисов)

_Сервис_ — это класс, выполняющий конкретную задачу. Основная цель сервисов — структурировать код, разделяя функционал приложения на независимые части. _Это сердце вашего приложения_, где происходят все важные операции.

_Ответственность сервисного слоя_:

- Реализация бизнес-логики и бизнес-правил.
- Координация работы нескольких репозиториев.
- Выполнение транзакций.
- Вызов других сервисов.

_Что сервисный слой НЕ должен делать_:

- Получать объекты запроса и ответа (req, res).
- Возвращать HTTP-статусы или заголовки.
- Напрямую работать с HTTP-протоколом.
- Напрямую работать с базой данных.

Сервис - это абстракция, которая позволяет изолировать бизнес-логику от технических деталей. Можно сказать, что сервис работает с "чистыми" данными, не заботясь о том, откуда они пришли и куда пойдут.

### Repository Layer (Слой репозиториев)

_Репозитории отвечают за доступ к данным_. Они абстрагируют работу с хранилищем данных (база данных, файловая система, внешний API). Репозитории обеспечивают удобный интерфейс для работы с данными и скрывают детали реализации.

_Ответственность репозиториев_:

- CRUD операции (Create, Read, Update, Delete).
- Построение SQL-запросов или вызовов ORM.
- Маппинг данных из базы данных в доменные объекты.

_Что репозитории НЕ должны делать_:

- Содержать бизнес-логику.
- Обрабатывать HTTP-запросы.
- Выполнять валидацию данных.
- Выполнять транзакции (это задача сервисного слоя).

### Model Layer (Слой моделей)

Модели представляют структуру данных в приложении. Это доменные объекты или _сущности (entities)_. Простыми словами, модели описывают, как выглядят данные и какие свойства они имеют, без привязки к конкретной реализации хранения данных.

То есть не важно с какого источника приходят данные — из базы данных, внешнего API или файла — модель описывает их структуру и поведение, и разработчик в любой момент может поменять источник данных, не затрагивая остальной код приложения.

_Ответственность моделей_:

- Определение структуры данных (поля, типы).
- Валидация на уровне модели (если используется ORM).

_Что модели НЕ должны делать_:

- Содержать бизнес-логику.
- Обрабатывать HTTP-запросы.
- Выполнять операции с базой данных напрямую.
- Содержать сложные вычисления.

### Пример реализации многослойной архитектуры

```js
// models/User.js
class User {
  constructor(id, email, name, createdAt) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
  }

  // Метод для проверки, является ли пользователь администратором
  isAdmin() {
    return this.email.endsWith('@admin.com');
  }
}

export default User;
```

```js
// repositories/UserRepository.js
import User from '../models/User';

class UserRepository {
  constructor(database) {
    this.db = database;
  }

  async findByEmail(email) {
    const result = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (result.length === 0) {
      return null;
    }

    // Маппинг данных из БД в доменную модель
    return new User(result.id, result.email, result.name, result.created_at);
  }

  async create(userData) {
    const result = await this.db.query(
      'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
      [userData.email, userData.name, userData.passwordHash],
    );

    return new User(result.insertId, userData.email, userData.name, new Date());
  }

  async findAll() {
    const results = await this.db.query('SELECT * FROM users');
    return results.map((row) => new User(row.id, row.email, row.name, row.created_at));
  }
}

export default UserRepository;
```

```js
// services/UserService.js
import bcrypt from 'bcrypt';

class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async registerUser(email, name, password) {
    // Бизнес-правило: проверка существования пользователя
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Бизнес-логика: хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await this.userRepository.create({
      email,
      name,
      passwordHash,
    });

    // Отправка приветственного email
    await this.emailService.sendWelcomeEmail(email, name);

    return user;
  }

  async getUserByEmail(email) {
    return await this.userRepository.findByEmail(email);
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }
}

export default UserService;
```

```js
// controllers/UserController.js
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async register(req, res, next) {
    try {
      // Валидация входных данных
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({
          error: 'Email, name and password are required',
        });
      }

      // Вызов сервисного слоя
      const user = await this.userService.registerUser(email, name, password);

      // Формирование HTTP-ответа
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
```

```js
// app.js

import express from 'express';
import UserController from './controllers/UserController.js';
import UserService from './services/UserService.js';
import UserRepository from './repositories/UserRepository.js';
import Database from './utils/Database.js';

const app = express();
app.use(express.json());
const database = new Database();
const userRepository = new UserRepository(database);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

app.post('/users', (req, res, next) => userController.register(req, res, next));
app.get('/users/:email', (req, res, next) => userController.getUser(req, res, next));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## Роль сервисного слоя

### Что такое сервисный слой?

Отдельно рассмотрим роль сервисного слоя в архитектуре бэкенд-приложений.

_Паттерн Service Layer_ - это архитектурный паттерн, который определяет границу приложения и набор доступных операций с точки зрения взаимодействующих клиентских слоев. Сервисный слой инкапсулирует бизнес-логику приложения.

Основные характеристики сервисного слоя:

- _Независимость от транспортного слоя_. Сервис не должен знать, вызывается ли он из HTTP-контроллера, CLI-команды или фоновой задачи.
- _Координация бизнес-процессов_. Сервис может вызывать несколько репозиториев и других сервисов для выполнения сложной операции.
- _Реализация бизнес-правил_. Все бизнес-правила и логика должны быть реализованы в сервисном слое.

### Где должна жить бизнес-логика

Существует два основных подхода к размещению бизнес-логики:

- Богатые модели (Rich Domain Model)
- Анемичные модели (Anemic Domain Model) и Богатые сервисы (Rich Services)

При первом подходе (богатые модели) большая часть бизнес-логики находится внутри самих моделей (entities). Модели содержат не только данные, но и методы для работы с этими данными.

```js
class Order {
  constructor(id, items, customerId) {
    this.id = id;
    this.items = items;
    this.customerId = customerId;
    this.status = 'pending';
  }

  // Бизнес-логика внутри модели
  calculateTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  applyDiscount(percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Invalid discount percentage');
    }

    const total = this.calculateTotal();
    return total - (total * percentage) / 100;
  }

  canBeCancelled() {
    return this.status === 'pending' || this.status === 'confirmed';
  }

  cancel() {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled');
    }
    this.status = 'cancelled';
  }
}
```

Во втором подходе (анемичные модели и богатые сервисы) модели содержат только данные, а вся бизнес-логика находится в сервисах.

```js
// Анемичная модель - только данные
class Order {
  constructor(id, items, customerId, status) {
    this.id = id;
    this.items = items;
    this.customerId = customerId;
    this.status = status;
  }
}

// Богатый сервис - вся логика здесь
class OrderService {
  calculateTotal(order) {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  applyDiscount(order, percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Invalid discount percentage');
    }

    const total = this.calculateTotal(order);
    return total - (total * percentage) / 100;
  }

  canBeCancelled(order) {
    return order.status === 'pending' || order.status === 'confirmed';
  }

  async cancelOrder(orderId) {
    const order = await this.orderRepository.findById(orderId);

    if (!this.canBeCancelled(order)) {
      throw new Error('Order cannot be cancelled');
    }

    order.status = 'cancelled';
    await this.orderRepository.update(order);
  }
}
```

> В Node.js чаще используется второй подход (анемичные модели + богатые сервисы), так как JavaScript не имеет строгой типизации и развитой системы классов, как в Java или C#

### Типы сервисов

Не все сервисы одинаковы. Существует несколько типов сервисов, каждый из которых имеет свою специфическую роль:

#### Доменные сервисы (Domain Services)

Доменные сервисы содержат бизнес-логику, которая не естественно вписывается в одну конкретную модель. Они работают с несколькими моделями и реализуют бизнес-правила, которые охватывают несколько сущностей.

```js
class PaymentService {
  constructor(paymentGateway, orderRepository) {
    this.paymentGateway = paymentGateway;
    this.orderRepository = orderRepository;
  }

  async processPayment(orderId, paymentDetails) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Бизнес-логика обработки платежа
    const paymentResult = await this.paymentGateway.charge(paymentDetails, order.totalAmount);

    if (paymentResult.success) {
      order.status = 'paid';
      await this.orderRepository.update(order);
    } else {
      throw new Error('Payment failed');
    }
  }
}
```

#### Сервисы приложений (Application Services)

Приложенческие сервисы координируют выполнение бизнес-процессов, вызывая доменные сервисы и репозитории. Они обеспечивают реализацию сценариев использования приложения.

```js
class OrderApplicationService {
  constructor(orderService, paymentService, emailService) {
    this.orderService = orderService;
    this.paymentService = paymentService;
    this.emailService = emailService;
  }

  async placeOrder(orderData, paymentDetails) {
    const order = await this.orderService.createOrder(orderData);

    await this.paymentService.processPayment(order.id, paymentDetails);

    await this.emailService.sendOrderConfirmation(order.customerEmail, order.id);

    return order;
  }
}
```

```js
class UserSerivice {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(email, name, password) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      name,
      passwordHash,
    });

    return user;
  }
}
```

#### Инфраструктурные сервисы (Infrastructure Services)

Инфраструктурные сервисы обеспечивают взаимодействие с внешними системами, такими как базы данных, очереди сообщений, внешние API и т.д. Они предоставляют абстракции для работы с этими системами.

```js
class EmailService {
  constructor(emailClient) {
    this.emailClient = emailClient;
  }

  async sendOrderConfirmation(email, orderId) {
    const subject = 'Order Confirmation';
    const body = `Your order with ID ${orderId} has been placed successfully.`;
    await this.emailClient.sendEmail(email, subject, body);
  }
}
```

_Важное правило_: инфраструктурные сервисы должны вызываться только из прикладных сервисов, а не из доменных сервисов или entities. Это помогает сохранить чистоту предметной области.

## Dependency Injection и Inversion of Control

### Что такое зависимость?

Перед тем как говорить о внедрении зависимостей, важно понять, что такое зависимость в контексте программирования.

_Зависимость_ — это объект, который используется внутри другого объекта для выполнения определённых задач. Если один класс опирается на функциональность другого, можно сказать, что между ними существует зависимость.

Рассмотрим пример класса `A`, который использует функциональность класса `B`:

```js
class B {
  doSomething() {
    console.log('Doing something in B');
  }
}

class A {
  constructor() {
    this.b = new B(); // Класс A зависит от класса B
  }

  performAction() {
    this.b.doSomething();
  }
}
```

В данном случае, класс `A` зависит от класса `B`, так как без него метод `performAction()` не может быть выполнен. Это пример типичной зависимости между объектами.

Однако использование зависимостей приводит к важной проблеме — связанности.

### Связанность (Coupling)

_Связанность_ — это мера зависимости одного класса от другого.

Выделают два основных типа связанности:

1. _Низкая связанность (Low Coupling)_. Классы слабо связаны и могут работать независимо друг от друга.
2. _Высокая связанность (High Coupling)_. Классы сильно связаны и тесно взаимодействуют друг с другом.

Чем сильнее два класса связаны, тем больше они зависят друг от друга, что может привести к нескольким проблемам:

1. _Трудности в тестировании_. Если классы сильно связаны, их трудно тестировать изолированно.
2. _Сложность изменений_. Изменения в одном классе могут потребовать изменений в зависимых классах.
3. _Низкая переиспользуемость_. Классы с высокой связанностью сложно использовать в других контекстах.

Рассмотрим пример:

```js
class Mailer {
  sendOrderConfirmation(email) {
    console.log('Order confirmation sent!');
  }
}

class OrderService {
  placeOrder(order) {
    const mailer = new Mailer(); // Высокая связанность
    // Логика размещения заказа
    mailer.sendOrderConfirmation(order.email);
  }
}
```

В данном коде класс `OrderService` напрямую создаёт объект `Mailer`, что означает _жёсткую зависимость_ между ними. Такой подход создаёт несколько проблем:

- _Нет гибкости_. Если необходимо заменить `Mailer` на другой класс (например, `SmsNotifier`), это потребует изменения кода `OrderService`.
- _Трудности тестирования_. Невозможно протестировать `OrderService` отдельно от `Mailer`.
- _Усложнение кода_. Если в `OrderService` добавится новый метод с использованием другого класса, количество жёстко связанных объектов будет расти.

К тому же может возникнуть ситуация, когда объект Mailer потребуется создавать в нескольких местах кода, что неизбежно приведёт к его дублированию и усложнению сопровождения программы.

Решением этой проблемы является использование паттерна _Inversion of Control_ (IoC).

### Inversion of Control (IoC)

_Inversion of Control (Инверсия управления, IoC)_ - это принцип проектирования, при котором управление созданием и жизненным циклом объектов передается извне, а не выполняется самим объектом или модулем. Вместо того чтобы объект сам создавал свои зависимости, они предоставляются ему извне.

IoC позволяет снизить связанность между классами, делая их более независимыми и гибкими. Это достигается за счёт передачи зависимостей в объект извне, например, через конструктор или сеттеры.

_Есть несколько способов реализации IoC_:

- _Dependency Injection (Внедрение зависимостей)_ (самый распространённый способ)
- _Service Container (Контейнер сервисов)_ (некоторая автоматизация DI)
- _Service Locator (Локатор сервисов)_

### Dependency Injection (DI)

_Dependency Injection (внедрение зависимостей)_ - это способ передачи объектов, от которых зависит класс, извне, вместо их создания внутри самого класса.

#### Как работает DI?

Вместо того чтобы класс сам создавал зависимости, они передаются ему «извне», например, через конструктор. Это снижает связанность и делает код более гибким, модульным и тестируемым.

#### Пример использования DI

Рассмотрим вышеупомянутый пример с `OrderService` и `Mailer`, но теперь с использованием Dependency Injection:

```js
class Mailer {
  sendOrderConfirmation(email) {
    console.log('Order confirmation sent!');
  }
}

class OrderService {
  constructor(mailer) {
    this.mailer = mailer; // Зависимость передается извне
  }

  placeOrder(order) {
    // Логика размещения заказа
    this.mailer.sendOrderConfirmation(order.email);
  }
}

// Использование
const mailer = new Mailer();
const orderService = new OrderService(mailer);
```

Теперь класс `OrderService` не создаёт объект `Mailer`, а получает его через конструктор. Это даёт ряд преимуществ:

1. _Гибкость_. Можно легко заменить `Mailer` на другой класс, например, `SmsNotifier`.
2. _Тестируемость_. В тестах можно передавать mock-объект вместо настоящего `Mailer`.
3. _Повторное использование_. `OrderService` может работать с любым объектом, реализующим требуемую функциональность.

### Service Locator

_Service Locator (Локатор сервисов)_ - это паттерн, который предоставляет централизованный способ получения зависимостей. Вместо того чтобы передавать зависимости через конструктор, класс запрашивает их у локатора сервисов.

```js
class ServiceLocator {
  constructor() {
    this.services = new Map();
  }

  register(name, instance) {
    this.services.set(name, instance);
  }

  get(name) {
    return this.services.get(name);
  }
}

class OrderService {
  constructor(serviceLocator) {
    this.serviceLocator = serviceLocator;
  }

  placeOrder(order) {
    const mailer = this.serviceLocator.get('mailer');
    // Логика размещения заказа
    mailer.sendOrderConfirmation(order.email);
  }
}

// Использование
const serviceLocator = new ServiceLocator();
serviceLocator.register('mailer', new Mailer());
const orderService = new OrderService(serviceLocator);
```

### Service Container

_Service Container (Контейнер сервисов)_ - это расширение паттерна Service Locator, которое автоматически управляет созданием и жизненным циклом зависимостей. Контейнер сервисов может создавать объекты по запросу, разрешать зависимости и обеспечивать конфигурацию.

```js
class ServiceContainer {
  constructor() {
    this.services = new Map();
  }

  register(name, factory) {
    this.services.set(name, factory);
  }

  get(name) {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    return factory(this);
  }
}

class Mailer {
  sendOrderConfirmation(email) {
    console.log('Order confirmation sent!');
  }
}

class OrderService {
  constructor(mailer) {
    this.mailer = mailer;
  }

  placeOrder(order) {
    // Логика размещения заказа
    this.mailer.sendOrderConfirmation(order.email);
  }
}

// Использование
const container = new ServiceContainer();
container.register('mailer', () => new Mailer());
container.register('orderService', (c) => new OrderService(c.get('mailer')));
const orderService = container.get('orderService');
```

> Выше приведена _упрощённая реализация контейнера сервисов_. В реальных приложениях используются более сложные библиотеки, такие как InversifyJS или Awilix.

## Чистая и гексагональная архитектура

Выше была рассмотрена многослойная архитектура, которая помогает структурировать код и разделять ответственность между различными слоями. Однако существуют и другие архитектурные паттерны, которые предлагают альтернативные подходы к организации кода.

Данные архитектурные паттерны являются реализацией _Domain Driven Design (DDD)_ - подхода к разработке программного обеспечения, который фокусируется на создании программных моделей, отражающих сложные бизнес-домены.

### Clean Architecture (Чистая архитектура)

Clean Architecture, предложенная Робертом Мартином (Uncle Bob), организует код в виде концентрических кругов, где зависимости направлены от внешних слоев к внутренним.

![Clean Architecture](https://cdn-media-1.freecodecamp.org/images/oVVbTLR5gXHgP8Ehlz1qzRm5LLjX9kv2Zri6)

Слои _Clean Architecture_:

- _Entities (Сущности)_. бизнес-объекты приложения.
- _Use Cases (Варианты использования)_. прикладная бизнес-логика, простыми словами, это логика, которая реализует конкретные сценарии использования приложения. Например, регистрация пользователя, оформление заказа, обработка платежа и т.д.
- _Interface Adapters (Адаптеры интерфейсов)_. контроллеры, презентеры. Преобразуют данные из формата, удобного для внутренней логики, в формат, удобный для внешних систем (например, HTTP).
- _Frameworks & Drivers (Фреймворки и драйверы)_. внешние инструменты (база данных, веб-фреймворк).

_Ключевой принцип_: зависимости всегда направлены внутрь. Внутренние слои ничего не знают о внешних.

### Hexagonal Architecture (Гексагональная архитектура)

Также известна как Ports and Adapters (Порты и адаптеры). Предложена Алистером Кокберном. Основная идея: изолировать бизнес-логику от внешних зависимостей через порты и адаптеры.

![Hexagonal Architecture](https://miro.medium.com/v2/resize:fit:700/1*aD3zDFzcF5Y2_27dvU213Q.png)

_Концепции_:

- _Порты (Ports)_. Интерфейсы, которые определяют, как внешний мир может взаимодействовать с приложением.
- _Адаптеры (Adapters)_. Конкретные реализации портов.
- _Домен (Domain)_. Центральная часть приложения с бизнес-логикой.

_Типы портов_:

- _Входящие порты (Inbound/Primary)_. Для инициирования действий (HTTP API, CLI).
- _Исходящие порты (Outbound/Secondary)_. Для взаимодействия с внешними системами (база данных, внешние API).

_Данные архитектуры сложно реализовать используя только JavaScript из-за отсутствия строгой типизации и интерфейсов_. И в целом, разрабатывая микросервисы не рекомендуется использовать чистую или гексагональную архитектуру из-за их сложности и избыточности для небольших сервисов. Однако, для крупных и сложных систем, где важна масштабируемость и поддерживаемость, эти архитектуры могут быть полезны.

## Почему TypeScript помогает соблюдать архитектурные принципы

Рассматривая многие архитектурные паттерны и принципы проектирования, важно отметить, что использование TypeScript может значительно улучшить качество кода и облегчить соблюдение этих принципов. Разрабатывая сервисы и модели с помощью JavaScript, вы можете столкнуться с проблемами, связанными с отсутствием строгой типизации, что может привести к ошибкам во время выполнения.

Например, рассмотрим пример с JavaScript:

```js
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    return user;
  }
}

const userRepository = 'string';
const userService = new UserService(someRepository);
userService.getUserById(1); // Ошибка во время выполнения, так как userRepository не является объектом
```

В TypeScript вы можете определить типы для ваших классов и методов, что позволяет выявлять ошибки на этапе компиляции:

```ts
interface IUserRepository {
  findById(id: number): Promise<User | null>;
}

class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    return user;
  }
}

const userRepository: IUserRepository = someRepository;
const userService = new UserService(userRepository);
userService.getUserById(1); // Ошибка на этапе компиляции, если userRepository не соответствует IUserRepository
```

В заданном примере TypeScript помогает гарантировать, что `userRepository` соответствует интерфейсу `IUserRepository`, что снижает риск ошибок во время выполнения и способствует соблюдению архитектурных принципов, таких как Dependency Inversion Principle (DIP) и Interface Segregation Principle (ISP).

[^1]: _SOLID Series: Liskov Substitution Principle (LSP)_. blog.logrocket.com [online]. Available at: https://blog.logrocket.com/liskov-substitution-principle-lsp/
