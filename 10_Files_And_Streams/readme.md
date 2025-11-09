# Работа с файлами и потоками в Express.js

## Введение: Зачем нам файлы и потоки?

Представьте, что ваше приложение должно обработать видеофайл размером 5 гигабайт. Если вы попытаетесь загрузить весь файл в оперативную память (RAM) перед обработкой, сервер может "упасть". Именно поэтому Node.js предоставляет два мощных инструмента:

- файловую систему (fs module)
- потоки (streams).

_Потоки_ — это абстракция для работы с последовательными данными, которые могут быть слишком большими, чтобы удерживать их всю в памяти. Вместо этого мы обрабатываем данные небольшими кусками, один за другим.

Реальный пример: когда вы смотрите видео на YouTube, браузер не загружает весь фильм сразу. Вместо этого видео поступает порциями — это и есть потоки.

## Основы работы с файловой системой (fs module)

_Файловая система_ это набор API, которые позволяют вашему приложению взаимодействовать с файлами на сервере.

### Что такое fs module?

_Модуль `fs` (File System)_ — это встроенный модуль Node.js, который позволяет взаимодействовать с файловой системой вашего компьютера. С его помощью вы можете читать, писать, удалять файлы и выполнять многие другие операции [^1].

### Импорт fs модуля

Для импорта модуля `fs` используйте следующий код:

```javascript
import fs from 'fs';
import { readFile, writeFile, unlink } from 'fs/promises';
```

> В примере используется `fs/promises` для работы с промисами вместо колбэков. Это более современный и удобный подход.

### Основные операции с файлами

_Чтение файла_

```javascript
import { readFile } from 'fs/promises';

async function readFileExample() {
  try {
    const data = await readFile('./data.txt', 'utf-8');
    console.log('Содержимое файла:', data);
  } catch (error) {
    console.error('Ошибка при чтении файла:', error.message);
  }
}

readFileExample();
```

Параметры `readFile`:

- `path` - путь до файла, строка с путём к файлу.
- `options` - объект с опциями (например, кодировка: 'utf-8').
- результат - промис, который разрешается с содержимым файла.

_Запись в файл_

```javascript
import { writeFile } from 'fs/promises';

async function writeFileExample() {
  try {
    await writeFile('./output.txt', 'Привет, Node.js!');
    console.log('Файл успешно записан');
  } catch (error) {
    console.error('Ошибка при записи:', error.message);
  }
}

writeFileExample();
```

Параметры `writeFile`:

- `path` - путь до файла, строка с путём к файлу.
- `data` - данные для записи (строка или буфер).
- `options` - объект с опциями (например, кодировка: 'utf-8').
- результат - промис, который разрешается после успешной записи.

_Добавление данных в конец файла_

```javascript
import { appendFile } from 'fs/promises';

async function appendToFile() {
  await appendFile('./log.txt', 'Новая строка\n');
}

appendToFile();
```

Параметры `appendFile`:

- `path` - путь до файла, строка с путём к файлу.
- `data` - данные для добавления (строка или буфер).
- `options` - объект с опциями (например, кодировка: 'utf-8').
- результат - промис, который разрешается после успешного добавления.

_Удаление файла_

```javascript
import { unlink } from 'fs/promises';

async function deleteFileExample() {
  try {
    await unlink('./output.txt');
    console.log('Файл успешно удалён');
  } catch (error) {
    console.error('Ошибка при удалении файла:', error.message);
  }
}

deleteFileExample();
```

\_Параметры `unlink`:

- `path` - путь до файла, строка с путём к файлу.
- результат - промис, который разрешается после успешного удаления.

_Проверка существования файла_

```javascript
import { access, constants } from 'fs/promises';

async function fileExists() {
  try {
    await access('./config.json', constants.F_OK);
    console.log('Файл существует');
  } catch (error) {
    console.log('Файл не найден');
  }
}

fileExists();
```

Параметры `access`:

- `path` - путь до файла, строка с путём к файлу.
- `mode` - режим проверки:
  - `F_OK` - проверка существования файла.
  - `R_OK` - проверка на чтение.
  - `W_OK` - проверка на запись.
- результат - промис, который разрешается, если файл доступен, и отклоняется, если нет.

### Синхронные vs Асинхронные операции

Node.js предоставляет две версии каждого метода: синхронную и асинхронную.

- _Синхронные методы_ блокируют выполнение кода до завершения операции, что может привести к "заморозке" приложения при работе с большими файлами.
- _Асинхронные методы_ используют колбэки или промисы, позволяя вашему приложению продолжать работу, пока операция выполняется в фоновом режиме. Рекомендуется использовать асинхронные методы для улучшения производительности.

| Версия      | Пример                          | Когда использовать                                                                                        |
| ----------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Асинхронная | `readFile`, `writeFile`         | При работе с большими файлами или в веб-приложениях. Всегда в production-коде, чтобы избежать блокировки. |
| Синхронная  | `readFileSync`, `writeFileSync` | Только при инициализации приложения, может заморозить сервер.                                             |

> Избегайте `readFileSync()`, `writeFileSync()` в основном коде обработки запросов. Это заблокирует весь сервер, пока операция завершится.

```js
//  ПЛОХО - заморозит сервер
import fs from 'fs';
const data = fs.readFileSync('./bigfile.txt', 'utf-8');
// Сервер ждёт...

//  ХОРОШО - не блокирует
import { readFile } from 'fs/promises';
const data = await readFile('./bigfile.txt', 'utf-8');
// Сервер продолжает обрабатывать другие запросы
```

## Введение в потоки данных (Streams)

### Что такое потоки и зачем они нужны?

_Поток (stream)_ — это объект в Node.js, который позволяет читать или писать данные небольшими порциями вместо загрузки всего содержимого в память сразу.

Рассмотрим следующий код:

```js
import fs from 'fs';

// Представим, что у нас есть огромный видеофайл размером 5 ГБ
const data = fs.readFileSync('./huge-video.mp4');
```

Если файл очень большой, попытка загрузить его целиком может привести к исчерпанию памяти и сбою приложения. Вместо этого мы можем использовать потоки:

```js
import fs from 'fs';

const stream = fs.createReadStream('./huge-video.mp4', {
  highWaterMark: 16 * 1024, // Читаем по 16KB за раз
});

stream.on('data', (chunk) => {
  console.log(`Получена порция данных: ${chunk.length} байт`);
  // Обрабатываем одну порцию
});

stream.on('end', () => {
  console.log('Весь файл обработан');
});
```

В этом примере мы читаем файл порциями по 16 килобайт, что позволяет эффективно использовать память и обрабатывать большие файлы.

Параметры `createReadStream`:

- `path` - путь до файла, строка с путём к файлу.
- `options` - объект с опциями:
  - `highWaterMark` - размер буфера для чтения (по умолчанию 64KB для файлов).
  - `encoding` - кодировка данных (например, 'utf-8').
- результат - объект потока чтения (ReadStream).

Функция `stream.on()` позволяет подписаться на события потока:

- `stream.on('data', callback)` - вызывается при получении каждой порции данных.
- `stream.on('end', callback)` - вызывается, когда весь файл прочитан.
- `stream.on('error', callback)` - вызывается при ошибке чтения.

### Пример использования потоков

Предположим, вам нужно обработать лог-файл, содержащий 1 миллион строк. С потоками вы можете обработать его построчно без загрузки в памяти:

```js
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: fs.createReadStream('./huge-log.txt'),
  crlfDelay: Infinity,
});

let lineCount = 0;

rl.on('line', (line) => {
  lineCount++;
  // Обработать одну строку
  if (line.includes('ERROR')) {
    console.log(`Ошибка на строке ${lineCount}: ${line}`);
  }
});

rl.on('close', () => {
  console.log(`Обработано ${lineCount} строк`);
});
```

В данном примере мы используем модуль `readline` для чтения файла построчно, что позволяет эффективно обрабатывать большие файлы логов. Данный пример можно реализовать и при помощи `streams` напрямую.

```js
import fs from 'fs';
const readStream = fs.createReadStream('./huge-log.txt', {
  encoding: 'utf-8',
  highWaterMark: 16 * 1024, // Читаем по 16KB за раз
});

let leftover = ''; // Для хранения неполной строки
let lineCount = 0;

readStream.on('data', (chunk) => {
  const lines = (leftover + chunk).split('\n');
  leftover = lines.pop(); // Сохраняем неполную строку для следующего чанка
  lines.forEach((line) => {
    lineCount++;
    // Обработать одну строку
    if (line.includes('ERROR')) {
      console.log(`Ошибка на строке ${lineCount}: ${line}`);
    }
  });
});

readStream.on('end', () => {
  if (leftover) {
    lineCount++;
    if (leftover.includes('ERROR')) {
      console.log(`Ошибка на строке ${lineCount}: ${leftover}`);
    }
  }
  console.log(`Обработано ${lineCount} строк`);
});
```

Однако, использование `readline` более удобно для построчной обработки.

## Типы потоков в Node.js

Node.js предоставляет четыре основных типа потоков [^2]:

- _Readable_ (потоки чтения)
- _Writable_ (потоки записи)
- _Duplex_ (двухсторонние потоки)
- _Transform_ (потоки преобразования)

### Readable Streams (Потоки чтения)

_Readable_ — поток, из которого вы читаете данные. Примеры: файл, HTTP запрос, сокет.

```js
import fs from 'fs';

const readStream = fs.createReadStream('./data.txt');

readStream.on('data', (chunk) => {
  console.log(`Получено ${chunk.length} байт`);
});
```

События `Readable`:

- `data` - новая порция данных готова
- `end` — больше нет данных
- `error` — произошла ошибка
- `pause` — поток остановлен
- `resume` — поток возобновлён

### Writable (Поток записи)

Writable — поток, который используется для записи данных. _Примеры_: файл на диске, HTTP ответ, сокет.

```js
import fs from 'fs';

const writeStream = fs.createWriteStream('./output.txt');

writeStream.write('Строка 1\n');
writeStream.write('Строка 2\n');
writeStream.end('Последняя строка\n');

writeStream.on('finish', () => {
  console.log('Все данные записаны');
});
```

Методы `Writable` потока:

- `write(data)` — запись данных (возвращает `true` или `false`)
- `end([data])` — завершить запись
- `on(event, callback)` — подписка на события
- `destroy()` — принудительно закрыть поток

События `Writable` потока:

- `drain` — буфер пуст, можно писать ещё
- `finish` — все данные записаны
- `error` — произошла ошибка

### Duplex (Двусторонний поток)

_Duplex_ — поток, который одновременно читает И пишет данные. Обе операции независимы друг от друга. Например, _TCP сокет_. Вы можете одновременно отправлять данные на сервер и получать ответ.

```js
import net from 'net';

const socket = net.createConnection(8000, 'localhost');

// Читаем данные с сервера
socket.on('data', (chunk) => {
  console.log('Получено:', chunk.toString());
});

// Пишем данные на сервер
socket.write('Привет, сервер!');
```

В этом примере `socket` является двусторонним потоком, позволяя одновременно читать и писать данные.

### Transform (Преобразующий поток)

_Transform_ — это специальный тип Duplex потока, где данные читаются, преобразуются, и затем пишутся. Выход зависит от входа. Например, сжатие файла, шифрование данных, преобразование формата.

```js
import fs from 'fs';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';

async function compressFile() {
  const source = fs.createReadStream('./data.txt');
  const destination = fs.createWriteStream('./data.txt.gz');
  const gzip = zlib.createGzip();

  // Читаем файл → сжимаем → пишем в новый файл
  await pipeline(source, gzip, destination);
  console.log('Файл успешно сжат');
}

compressFile().catch(console.error);
```

Типы `Transform` потоков в Node.js:

- `zlib.createGzip()` — сжатие в формат gzip
- `zlib.createDeflate()` — сжатие в формат deflate
- `zlib.createBrotliCompress()` — сжатие в формат brotli

## Pipe: связывание потоков

### Что такое pipe?

_Pipe_ (Pipeline) — это метод для соединения потоков так, чтобы выход одного потока автоматически направлялся на вход другого. Для этого используется метод `pipe()`.

```js
readStream.pipe(transformStream).pipe(writeStream);
```

Это эквивалентно следующему коду:

```js
readStream.on('data', (chunk) => {
  transformStream.write(chunk);
});

transformStream.on('data', (chunk) => {
  writeStream.write(chunk);
});
```

### Пример: копирование файла с использованием pipe

```js
import fs from 'fs';

const source = fs.createReadStream('./original.txt');
const destination = fs.createWriteStream('./copy.txt');

source.pipe(destination);

destination.on('finish', () => {
  console.log('Файл скопирован');
});

destination.on('error', (error) => {
  console.error('Ошибка при копировании:', error.message);
});
```

### Пример: сжатие файла

```js
import fs from 'fs';
import zlib from 'zlib';

const source = fs.createReadStream('./data.txt');
const gzip = zlib.createGzip();
const destination = fs.createWriteStream('./data.txt.gz');

source.pipe(gzip).pipe(destination);

destination.on('finish', () => {
  console.log('Файл сжат');
});
```

## Обработка ошибок в потоках

### Проблема обычного pipe

При использовании простого `pipe()`, ошибки не распространяются автоматически через всю цепь:

```js
// ПРОБЛЕМА: ошибка в source не будет перехвачена
readStream
  .pipe(transformStream)
  .pipe(writeStream)
  .on('error', (err) => {
    console.error('Ошибка:', err);
    // Но ошибка в readStream не будет здесь перехвачена!
  });
```

### Правильный способ: pipeline

Используйте `pipeline` из модуля `stream/promises` — это автоматически обрабатывает ошибки и очищает ресурсы:

```js
import fs from 'fs';
import { pipeline } from 'stream/promises';
import zlib from 'zlib';

async function compressFile() {
  try {
    const source = fs.createReadStream('./data.txt');
    const gzip = zlib.createGzip();
    const destination = fs.createWriteStream('./data.txt.gz');

    // pipeline автоматически перехватывает ошибки из всех потоков
    await pipeline(source, gzip, destination);
    console.log('Операция завершена успешно');
  } catch (error) {
    console.error('Ошибка в pipeline:', error.message);
  }
}

compressFile();
```

> Всегда используйте `pipeline()` вместо простого `pipe()` для надёжной обработки ошибок.

### Добавление обработчиков ошибок к каждому потоку

Если вы не используете `pipeline`, добавляйте обработчики ошибок к каждому потоку:

```js
const readStream = fs.createReadStream('./data.txt');
readStream.on('error', (error) => {
  console.error('Ошибка чтения:', error.message);
});

const writeStream = fs.createWriteStream('./output.txt');
writeStream.on('error', (error) => {
  console.error('Ошибка записи:', error.message);
});

readStream.pipe(writeStream);
```

## Backpressure: управление потоком данных

### Что такое backpressure?

Представьте, что вода из крана течёт быстро, но раковина медленно сливает воду. Раковина переполняется. Это называется backpressure.

В Node.js backpressure возникает, когда Readable поток отправляет данные быстрее, чем Writable поток их обрабатывает.

### Проблема без управления backpressure

Рассмотрим пример без управления backpressure:

```js
// sНЕПРАВИЛЬНО: может привести к утечке памяти
const readStream = fs.createReadStream('./huge-file.txt');
const writeStream = fs.createWriteStream('./output.txt');

readStream.on('data', (chunk) => {
  writeStream.write(chunk);
});
```

В примере выше, если `writeStream` не успевает записывать данные, память может переполниться. В этом случае нужно правильно управлять потоком данных.

### Правильное управление backpressure

```js
import fs from 'fs';

const readStream = fs.createReadStream('./huge-file.txt');
const writeStream = fs.createWriteStream('./output.txt');

readStream.on('data', (chunk) => {
  const canContinue = writeStream.write(chunk);

  if (!canContinue) {
    // Буфер переполнен, остановим читение
    readStream.pause();
    console.log('Поток остановлен');
  }
});

writeStream.on('drain', () => {
  // Буфер пуст, можем продолжить
  readStream.resume();
  console.log('Поток возобновлен');
});
```

> Совет: используйте `pipeline()` — они автоматически управляют `backpressure`. Вам не нужно вручную вызывать `pause()` и `resume()`.

## Использование потоков с оператором for await of

Node.js поддерживает асинхронные итераторы, что позволяет использовать оператор `for await...of` для чтения из потоков. Данный синтаксис упрощает работу с потоками.

_Пример чтения файла построчно с использованием for await...of:_

```js
import fs from 'fs';

async function readFileLineByLine() {
  const readStream = fs.createReadStream('./data.txt', {
    encoding: 'utf-8',
    highWaterMark: 16 * 1024, // Читаем по 16KB за раз
  });

  let leftover = ''; // Для хранения неполной строки
  let lineCount = 0;

  for await (const chunk of readStream) {
    const lines = (leftover + chunk).split('\n');
    leftover = lines.pop(); // Сохраняем неполную строку для следующего чанка
    lines.forEach((line) => {
      lineCount++;
      // Обработать одну строку
      if (line.includes('ERROR')) {
        console.log(`Ошибка на строке ${lineCount}: ${line}`);
      }
    });
  }
}

readFileLineByLine().catch(console.error);
```

_Пример обработки потокового Video с OpenAI API:_

```js
import fs from 'fs';
import express from 'express';
import multer from 'multer';
import { pipeline } from 'stream/promises';
import OpenAI from 'openai';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Загрузка аудиофайла и отправка на транскрипцию
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Нет аудиофайла' });
    }

    // Используем поток для транскрипции
    const transcription = await openai.audio.transcriptions.create({
      file: req.file.buffer, // Буфер содержит аудиоданные
      model: 'whisper-1',
      language: 'ru',
    });

    res.json({
      text: transcription.text,
      language: transcription.language,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Потоковая обработка с GPT
app.post('/stream-completion', express.json(), async (req, res) => {
  try {
    const { messages } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      stream: true,
    });

    // Отправляем каждый токен по мере его получения
    for await (const chunk of stream) {
      const content = chunk.choices.delta.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен');
});
```

## Загрузка файлов в Express с помощью Multer

Использование потоков и файловой системы особенно полезно при загрузке файлов в веб-приложениях. В Express.js для этого часто используется библиотека Multer.

### Что такое Multer?

_Multer_ — это популярное middleware для Express, которое упрощает обработку загрузки файлов [^3]. Оно построено на основе библиотеки Busboy и предоставляет удобный API для валидации, сохранения и обработки файлов.

### Установка Multer

Для установки Multer выполните следующую команду:

```bash
npm install multer
```

### Простой пример загрузки файла

```js
// app.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// dirname - получение текущей директории в ES модулях
// import.meta.url содержит URL текущего модуля
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Папка, где будут сохраняться файлы
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    // Название файла: временная метка + оригинальное имя
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Маршрут для загрузки одного файла
// file - имя поля в форме для файла
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не был загружен' });
  }

  res.json({
    message: 'Файл успешно загружен',
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
```

### Валидация типов файлов

Всегда валидируйте типы файлов на сервере, даже если у вас есть валидация на клиенте:

```js
import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

// Список разрешённых MIME-типов
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Функция для валидации расширения файла
const allowedExtensions = /\.(jpg|jpeg|png|pdf)$/i;

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Максимум 10MB
  },
  fileFilter: async (req, file, cb) => {
    // Проверка расширения
    const extValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    if (!extValid) {
      return cb(new Error('Недопустимый тип файла'));
    }

    // Проверка MIME-типа из заголовка запроса
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('MIME-тип не разрешён'));
    }

    cb(null, true);
  },
});

app.post('/upload-safe', upload.single('file'), (req, res) => {
  res.json({ message: 'Файл загружен и валидирован' });
});

// Обработка ошибок Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Неожиданное поле файла' });
    }
  }

  if (error.message) {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: 'Ошибка загрузки' });
});
```

> Можно интегрировать данную ошибку в глобальный обработчик ошибок вашего приложения, рассмотренный в прошлой теме.

### Параметр fileFilter

В `fileFilter` вы можете реализовать любую логику проверки файлов.

```js
const upload = multer({
  storage: storage,

  // Функция для валидации файлов
  fileFilter: (req, file, cb) => {
    const mime = ['image/jpeg', 'image/png'];

    if (mime.includes(file.mimetype)) {
      cb(null, true); // Принять файл
    } else {
      cb(new Error('Недопустимый MIME-тип')); // Отклонить файл
    }
  },
});

// Для множественной загрузки
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  res.json({
    message: 'Файлы загружены',
    count: req.files.length,
    files: req.files.map((f) => ({
      filename: f.filename,
      size: f.size,
    })),
  });
});
```

### Получение загруженных файлов

При обработке загруженных файлов вы можете обращаться к ним через объект запроса:

- `req.file` — если загружается один файл;
- `req.files` — если загружается несколько файлов;

Однако, поскольку в вашем приложении отсутствует маршрут вида `/uploads/:filename`, который позволяет отдавать файлы пользователю, необходимо реализовать его самостоятельно. Пример реализации:

```js
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filePath);
});
```

Такой маршрут обеспечит возможность загрузки файлов по их имени из папки `uploads`.

Либо же реализовать статическую раздачу файлов из папки `uploads`:

```js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

Это означает, что все файлы в папке `uploads` будут доступны по URL `/uploads/имя_файла`.

## Безопасность при работе с файлами

### Основные угрозы

Среди основных угроз при работе с файлами можно выделить:

- _Path Traversal_: атакующий может загрузить файл с именем `../../etc/passwd`, чтобы получить доступ к системным файлам
- _Вирусы_: загруженный файл может содержать вредоносный код
- _DoS атаки_: загрузка очень больших файлов
- _Подделка типа файла_: переименование `.exe` в `.jpg`

### Рекомендации по безопасности

- _Используйте безопасные имена файлов_: никогда не используйте оригинальные имена файлов, предоставленные пользователем. Генерируйте уникальные имена.

  ```js
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, uniqueSuffix + path.extname(file.originalname));
  ```

- _Ограничьте размер файлов_: используйте опцию `limits` в Multer для ограничения максимального размера загружаемых файлов.

  ```js
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Максимум 10MB
  });
  ```

- _Проверка пути_ для предотвращения Path Traversal: всегда сохраняйте файлы в заранее определённой директории и не позволяйте пользователям указывать пути.

  ```js
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads/')); // Фиксированная папка
    },
  });
  ```

  ```js
  app.get('/uploads/:filename', (req, res) => {
    const filename = path.basename(req.params.filename); // Извлекаем только имя файла
    const filePath = path.join(__dirname, 'uploads', filename);
    res.sendFile(filePath);
  });
  ```

- _Проверяйте типы файлов_: используйте `fileFilter` для проверки MIME-типа и расширения файлов.

  ```js
  const allowedExtensions = /\.(jpg|jpeg|png|pdf)$/i;

  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (!allowedExtensions.test(path.extname(file.originalname).toLowerCase())) {
        return cb(new Error('Недопустимый тип файла'));
      }
      cb(null, true);
    },
  });
  ```

- _Логируйте загрузки_: ведите журнал всех загрузок файлов для аудита и обнаружения подозрительной активности.

- _Регулярно обновляйте зависимости_: следите за обновлениями Multer и других библиотек для устранения известных уязвимостей.

### Использование clamav для сканирования вирусов

Для повышения безопасности можно интегрировать антивирусное сканирование загружаемых файлов с помощью _ClamAV_. Вот пример использования библиотеки `clamav.js` для сканирования файлов после их загрузки:

> _ClamAV_ — это открытый антивирус. Убедитесь, что он установлен на сервере.

```bash
# Установка на Ubuntu
sudo apt-get install clamav clamav-daemon
sudo freshclam  # Обновление базы вирусов
sudo systemctl start clamav-daemon
```

_Использование clamav.js в Express с Multer:_

```js
import NodeClam from 'clamscan';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Инициализация ClamAV сканера
let clamscanInstance;

async function initializeClamScan() {
  try {
    clamscanInstance = await new NodeClam().init({
      removeInfected: true, // Удалить заражённые файлы
      scanLog: null,
      debugMode: false,
      clamdscan: {
        socket: '/var/run/clamav/clamd.ctl',
        timeout: 60000,
      },
    });
    console.log('ClamAV инициализирован');
  } catch (error) {
    console.error('Ошибка инициализации ClamAV:', error);
  }
}

initializeClamScan();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueFilename = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    cb(null, uniqueFilename + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Middleware для сканирования
async function virusScanMiddleware(req, res, next) {
  if (!req.file || !clamscanInstance) {
    return next();
  }

  try {
    const { isInfected, viruses } = await clamscanInstance.scanFile(req.file.path);

    if (isInfected) {
      // Файл заражён, он уже удалён (removeInfected: true)
      return res.status(400).json({
        error: 'Обнаружен вирус',
        viruses: viruses,
      });
    }

    next();
  } catch (error) {
    console.error('Ошибка при сканировании:', error);

    // Удалить файл при ошибке сканирования
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Ошибка при сканировании файла' });
  }
}

// Маршрут с проверкой на вирусы
app.post('/upload-secure', upload.single('file'), virusScanMiddleware, (req, res) => {
  res.json({
    message: 'Файл успешно загружен и проверен',
    filename: req.file.filename,
  });
});

app.listen(3000, () => {
  console.log('Сервер запущен');
});
```

[^1]: _Node.js File System Documentation_. nodejs.org [online]. Available at: https://nodejs.org/docs/latest/api/fs.html
[^2]: _Stream_. nodejs.org [online]. Available at: https://nodejs.org/docs/latest/api/stream.html
[^3]: _Multer_. npmjs.com [online]. Available at: https://www.npmjs.com/package/multer
