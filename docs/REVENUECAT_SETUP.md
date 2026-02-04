# Настройка In-App Purchases (RevenueCat + App Store Connect)

Этот документ описывает процесс настройки покупок (чаевых) для iOS приложения через RevenueCat.

## 1. Apple App Store Connect

Перед тем как RevenueCat сможет работать, необходимо создать товары в Apple.

### 1.1. Соглашения (Agreements)
1. Откройте [App Store Connect](https://appstoreconnect.apple.com/).
2. Перейдите в раздел **"Business"** (ранее "Agreements, Tax, and Banking").
3. Убедитесь, что у вас подписано "Paid Apps Agreement". Также может потребоваться заполнить налоговые формы и банковские реквизиты.

### 1.2. Создание товаров (In-App Purchases)
1. Перейдите в **My Apps** -> выберите ваше приложение.
2. В боковом меню найдите раздел **In-App Purchases**.
3. Нажмите `+` для создания нового товара.
4. Выберите тип **Consumable** (Расходуемая покупка), так как чаевые можно покупать многократно.
5. Заполните поля:
   - **Product ID**: Уникальный ID, например `com.guestspot.app.tip_small`.
   - **Reference Name**: Внутреннее название (например, "Small Tip").
   - **Price Tier**: Выберите стоимость (например, Tier 1 = $0.99).
   - **App Store Localization**: Имя и описание, которые увидит пользователь.
6. **Скриншот для ревью**: Загрузите любой скриншот экрана покупки (можно мокап), иначе товар не сможет перейти в статус "Ready to Submit".
7. Сохраните. Статус товара должен стать "Ready to Submit" (или "Missing Metadata").

## 2. RevenueCat

RevenueCat управляет покупками и синхронизирует их между платформами.

### 2.1. Создание проекта
1. Зарегистрируйтесь/войдите в [RevenueCat](https://www.revenuecat.com/).
2. Создайте новый проект "GuestSpot".

### 2.2. Добавление приложения (iOS)
1. В настройках проекта выберите **Apps** -> **Add App** -> **App Store**.
2. Введите **App Bundle ID** (например, `com.guestspot.app`).
3. Введите **App Store Connect Shared Secret**.
   - Чтобы получить его: App Store Connect -> Users and Access -> Integrations -> In-App Purchase -> Shared Secret.

### 2.3. Создание продуктов (Products)
1. В RevenueCat перейдите в раздел **Products**.
2. Создайте продукты с **точно такими же Identifier**, как вы создали в App Store Connect (п. 1.2).

### 2.4. Создание предложений (Offerings)
Код приложения запрашивает "Current Offering".
1. Перейдите в раздел **Offerings**.
2. Создайте Offering с идентификатором `default`.
3. Нажмите на него и создайте **Packages** (пакеты), привязав к ним созданные Products.
4. В списке Offerings нажмите на меню (три точки) у `default` offering и выберите **"Make Current"**.

### 2.5. Получение API ключей
1. Перейдите в Project Settings -> **API Keys**.
2. Скопируйте **Public API Key** для iOS (начинается на `appl_`).
3. Скопируйте **Public API Key** для Android (начинается на `goog_`), если настраиваете и его.

## 3. Настройка проекта (Env)

В проекте используется файл `.env` для хранения ключей.

1. Скопируйте `.env.example` в `.env` (если файла еще нет).
2. Заполните переменные ключами из RevenueCat:

```properties
REVENUECAT_API_KEY_IOS=appl_...
REVENUECAT_API_KEY_ANDROID=goog_...
```

## 4. Тестирование

Тестирование покупок на iOS возможно **только на реальном устройстве**.

1. Создайте **Sandbox Tester** в App Store Connect (Users and Access -> Sandbox Testers).
2. На iPhone выйдите из своего Apple ID в **Настройки -> App Store -> Sandbox Account** (этот раздел внизу).
3. Войдите под тестовым аккаунтом.
4. Запустите приложение через Xcode.
5. При покупке появится системный диалог с пометкой `[Environment: Sandbox]`.
