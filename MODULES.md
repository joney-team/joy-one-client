# Joy One Server - Module List

> Multi-tenant workspace management platform supporting various business types: spa, clinic, finance, retail...

---

## Architecture Overview

| Layer              | Technology                                   |
| ------------------ | -------------------------------------------- |
| Framework          | NestJS                                       |
| Database (NoSQL)   | MongoDB                                      |
| Database (SQL)     | PostgreSQL (orders, receipts, loans, stocks)  |
| Cache              | Redis                                        |
| Queue              | BullMQ (Redis)                               |
| Search             | Elasticsearch                                |
| Realtime           | Socket.IO (WebSocket)                        |
| Storage            | Local / S3 / Cloudflare R2                   |
| Push Notification  | Firebase FCM                                 |
| Email              | SMTP (Nodemailer + MJML)                     |
| API                | REST + GraphQL (parallel)                    |

---

## 1. Authentication & Users

### `auth`
**User authentication and login.** Handles the entire login, registration, and session management flow.

- `signInWithFirebase` - Sign in via Firebase (Google, Apple, Phone)
- `signInWithEmailPassword` - Sign in with email/password
- `signInWithFacebook` - Sign in with Facebook
- `signUpWithEmailPassword` - Register a new account
- `refreshToken` - Refresh access token from refresh token
- `signOut` / `signOutOtherDevices` - Sign out current device / all other devices
- `requestRenewPassword` - Request password reset
- `verifyRenewPasswordCode` - Verify password reset code
- `renewPassword` - Reset password with code
- `verifyAccessToken` - Verify access token and return user

### `users`
**System user account management.** Stores and manages user accounts in MongoDB.

- `create` / `createUserApp` - Create new user / app-type user
- `get` / `getByEmail` / `getByUsername` / `getByRefCode` - Get user by multiple methods
- `updateProfile` - Update profile (name, avatar, birthday, phone, settings)
- `updatePassword` - Change password
- `uploadAvatar` - Upload avatar image
- `syncWithAuthProvider` - Sync with OAuth provider
- `setActivatedWorkspace` / `unsetActivatedWorkspace` - Set active workspace
- `setLocale` - Set language preference
- `increaseAuthVersion` - Increase auth version (invalidates all old tokens)
- `online` / `offline` - Update realtime connection status

### `user-auth-sessions`
**Password reset auth sessions.** Manages OTP sessions for the forgot password flow.

- `requestRenewPassword` - Create session and send OTP code via email
- `verifyRenewPasswordCode` - Verify OTP code
- `renewPassword` - Set new password after verification
- `cleanExpiredSessions` - Clean up expired sessions

---

## 2. Workspace

### `workspaces`
**Workspace management.** Core module - each workspace represents a separate organization/business.

- `create` - Create new workspace (auto-creates owner member, registers schedule)
- `update` - Update workspace information
- `get` / `getByCode` / `getByDomain` / `getByInviteCode` - Get workspace by multiple methods
- `getWithCache` / `getMetadataWithCache` - Get with Redis cache
- `generateCoverImage` - Generate workspace cover image with Jimp
- `generateInviteCode` - Generate invite code to join workspace
- `inviteInformation` / `inviteMetadata` - Invite page information
- `archive` - Archive / close workspace
- `list` - List workspaces (with permissions)
- `sync` - Sync branch count

### `workspace-members`
**Workspace members.** Manages User-Workspace relationships, permissions, and member information.

- `join` / `joinWithInviteCode` - Add member to workspace
- `remove` - Remove member from workspace
- `update` - Update member info (display name, color, work shift)
- `assignRoles` - Assign roles to member
- `transferOwner` - Transfer workspace ownership
- `get` / `getInfo` / `getByUserId` / `getByMemberId` - Get member information
- `getByPermission` / `getByPermissions` - Get members by permissions
- `getAdmins` - Get admin and owner list
- `getUserPublicInformation` - Get user public information
- `list` - List members (filterable by branch)
- `onlineStatus` - Online status of members

### `workspace-roles`
**Roles and permissions (RBAC).** Role-Based Access Control system for workspace.

- `create` / `update` / `remove` - CRUD custom roles
- `getWorkspaceRoles` - Get all roles (default OWNER, ADMIN, MEMBER + custom roles)
- `getMemberRoles` - Get roles and permissions of a specific member
- `getMembersMatchPermission` - Get members with specific permissions
- `cleanPermissions` - Filter valid permissions

### `workspace-branches`
**Workspace branches.** Supports workspaces with multiple branches/locations.

- `create` / `update` / `archive` - CRUD branches
- `list` - List branches
- `get` / `getById` / `getByIds` / `getByWorkspaceId` - Get branches by multiple methods
- `getWithCache` / `clearCache` - Get/clear branch cache

### `workspace-settings`
**Workspace settings.** Stores all workspace configurations.

- `get` - Get settings (auto-creates if not exists)
- `patchUpdate` - Update settings:
  - Tip, memberPermissions
  - Bookings (auto reminders, allow overlapping)
  - Receipts (require photo, default payment method)
  - Schedule (work schedule)
  - BankAccount (bank account info, VietQR lookup)
  - Mailer (custom email config, encrypted)
  - LoanSettings, View, ZaloOaGmfGroupSettings

### `workspace-billings`
**Billing history / workspace wallet.** Manages internal financial transactions between workspace and system.

- `deposit` / `withdraw` - Deposit / withdraw funds
- `addPayment` - Add payment (auto-deducts if sufficient balance)
- `addCashback` - Cashback/refund
- `autoPayment` - Auto-process pending payments
- `report` - Balance and pending payment report
- `list` / `get` - List / get transactions

### `workspace-subscriptions`
**Workspace subscription plans.** Manages subscription plans and calculates billing by member count.

- `get` - Get current subscription (with stats: member count, storage, pages, Zalo OAs)
- `select` - Select new plan (calculate and create billing)
- `setFixed` - Admin sets a fixed plan for workspace
- `calculateBilling` - Calculate costs by member count, days in month
- `handleBillings` - Auto-process payments/refunds

### `workspace-api-apps`
**API Apps (third-party applications).** Allows creating API apps with secret keys for external integration.

- `create` - Create new app (creates APP-type user + member, generates secret key)
- `update` - Update name, roles, branches of app
- `archive` - Disable app
- `list` - List apps
- `verifyKey` - Verify secret key
- `getSecretKey` / `resetSecretKey` - Create/regenerate secret key (AES encrypted)

### `workspace-sdks`
**SDK keys for workspace.** Provides SDK keys for client-side integration (chat widget...).

- `create` / `remove` - Create/delete SDK key
- `list` - List SDK keys
- `auth` - Authenticate SDK key (decrypt and get workspace)

### `workspace-stats`
**Workspace overview statistics.** Aggregates workspace metrics.

- `get` - Get statistics (from cache or aggregate)
- `aggregate` - Recalculate: storageUsage, memberCount, bookingCount, customerCount, orderCount
- `list` - List all workspace statistics (for admin)

---

## 3. Customers (CRM)

### `customers`
**Customer management.** Core CRM module, manages workspace customer list.

- `create` / `update` / `archive` - CRUD customers
- `get` / `getWithCache` / `getByCode` - Get customer by multiple methods
- `assign` - Assign staff member to customer
- `addDevice` / `removeDevice` / `removeAllDevices` - Manage customer devices
- `setAvatar` - Update customer avatar
- `lastCheckin` - Update last check-in time
- `updateLastInteractionAt` - Update last interaction time
- `authSignInWithZaloOa` - Authenticate customer via Zalo OA
- `auth` / `authRefreshToken` - Authenticate customer with separate token
- `timeSeriesReport` / `metricsReport` - Customer reports over time
- `bulkUpdateWorkspaceBranch` - Bulk update branches
- `isPhoneExisted` - Check if phone number already exists

### `customer-contacts`
**Customer contacts/directory.** Stores additional contact information for each customer.

- `get` - Get customer contacts (auto-creates if not exists)
- `set` - Update entire contact list
- `list` - List contacts by workspace

### `customer-forms`
**Customer registration forms.** Registration forms from landing pages/widgets, pending approval to convert to customers.

- `create` - Create new form (checks for duplicate phone numbers)
- `update` - Update info + status (PENDING/APPROVED/CANCELLED)
- `archive` / `bulkArchive` - Delete form / bulk delete
- `list` - List forms
- `bulkUpdateWorkspaceBranch` - Bulk update branches

### `customer-kycs`
**Customer identity verification (KYC).** Manages ID card/citizen ID verification process.

- `register` - Register KYC (upload ID front/back + portrait photo)
- `get` - Get KYC by customerId
- `approve` / `reject` - Approve / reject KYC (with reason)
- `list` - List KYCs

---

## 4. Products & Services

### `products`
**Product/service management.** Product catalog with combo, voucher, and inventory support.

- `create` / `update` / `archive` - CRUD products
- `get` / `getByIds` - Get products by ID
- `list` - List (filter by type, categoryId, isStockCheck)
- `bindData` - Bind additional: category, customFields, combos, stock, supplies
- `validateSupplies` / `getCombos` / `validateCombos` - Handle ingredients/combos
- `clearCategory` - Remove category when category is deleted

### `product-stocks`
**Product inventory management.** Inventory system using PostgreSQL with ACID transactions.

- `stockIn` - Stock in (create new stock entry)
- `stockOut` - Stock out (FIFO, auto-selects batch)
- `revertStockIn` / `revertStockOut` - Revert stock in/out
- `multipleProductsStockIn` - Stock in multiple products at once
- `getProductStock` - Get total stock of a product
- `listStock` / `listRecords` - List batches / transaction history

### `product-combos`
**Product combos / service cards.** Manages combo/service cards issued to customers (e.g., 10-session massage card).

- `create` - Create combo (from order or manual)
- `get` / `getByIds` / `getByCustomer` / `getBySource` - Get combos
- `use` - Use combo (log history, decrease quantity)
- `revertHistory` / `revertHistoryByRef` - Revert combo usage
- `remove` / `removeBySource` - Delete combo
- `list` - List combos

### `product-vouchers`
**Product vouchers.** Manages monetary value vouchers linked to products.

- `create` / `triggerCreate` - Create voucher (via queue)
- `get` / `getMany` - Get vouchers
- `list` - List vouchers
- `sync` - Sync status (ACTIVE/EXPIRED/OUT_OF_AMOUNT)
- `use` - Mark as used

### `categories`
**Product/post categories.**

- `create` / `update` / `remove` / `archive` - CRUD categories
- `get` / `list` - Get categories
- `sort` - Sort category order
- `generateSlug` - Generate slug from name
- `isSlugExisted` - Check for duplicate slugs

---

## 5. Transactions

### `orders`
**Order management.** Core sales module using PostgreSQL with ACID transactions.

- `create` - Create new order
- `update` - Update order
- `archive` - Cancel order
- `get` / `list` - Get orders
- `calculate` - Calculate order total
- `pay` - Pay order (creates receipt, processes stock out, applies promotion/coupon)

### `receipts`
**Receipt management (income/expense).** Records all financial transactions of the workspace.

- `create` - Create receipt
- `update` - Update receipt
- `pay` - Pay receipt (CASH/TRANSFER/PARTIAL)
- `disburse` - Disburse (for loans)
- `partialPayment` - Partial payment
- `archive` - Cancel receipt
- `get` / `list` - Get receipts
- `timeSeriesReport` / `metricsReport` - Time-based reports

### `bookings`
**Appointment management.** Schedule appointments for customers with staff members.

- `create` - Create appointment
- `update` - Update appointment
- `reschedule` - Reschedule appointment
- `cancel` - Cancel appointment
- `get` / `list` - Get appointments (filter by customer, status, time range)
- `timeSeriesReport` / `metricsReport` - Time-based reports
- Integrated with Zalo OA for new appointment notifications

### `loans`
**Loan/credit management.** Full credit module supporting multiple loan types, contract signing, disbursement.

- `create` - Create loan application
- `update` - Update information
- `fulfill` - Approve and disburse
- `reject` / `bulkReject` - Reject applications
- `sign` - Sign contract
- `archive` / `bulkArchive` - Archive
- `get` / `list` - Get loans
- `updateLoanPackage` - Update loan package
- `updateAmount` / `updateAssetData` - Update amount / collateral assets
- `import` - Bulk import from file
- `calculatePaymentPlan` - Calculate repayment plan
- `timeSeriesReport` / `metricsReport` - Reports

### `prescriptions`
**Prescription management.** For medical/spa facilities to store prescriptions and treatment plans.

- `create` / `update` / `remove` - CRUD prescriptions
- `get` / `list` - Get prescriptions

---

## 6. Promotions

### `promotions`
**Promotion campaigns.** Supports promotions with dynamic conditions (product discounts, customer groups...).

- `create` / `update` / `archive` - CRUD promotions
- `get` / `list` - Get promotions
- `use` - Apply promotion to order
- `bindDynamicSelection` - Bind product/customer info in conditions

### `coupons`
**Discount coupons.** Create and manage coupons linked to coupon rules.

- `create` - Create coupon (linked to rule, customer, receipt)
- `get` / `getByCode` / `getMany` - Get coupons
- `list` - List coupons
- `archive` - Deactivate coupon
- `use` - Use coupon

### `coupon-rules`
**Coupon rules.** Define coupon types, benefits, and terms.

- `create` / `update` / `archive` - CRUD coupon rules
- `get` / `list` - Get coupon rules
- `bindData` - Bind related product list

---

## 7. Content

### `posts`
**Post/content management.** Supports blog, landing pages, content marketing.

- `create` / `update` / `archive` / `bulkArchive` - CRUD posts
- `get` / `list` / `getBySlug` - Get posts
- `generateSlug` - Generate slug from title (removes Vietnamese diacritics)
- `bindData` - Bind additional category, customFields

### `tags`
**Tags/Labels.** Shared tagging system for multiple entities (customers, products...).

- `create` / `update` / `archive` - CRUD tags
- `get` / `list` - Get tags
- `bulkUpdate` - Bulk update tags

### `custom-fields`
**Custom data fields.** Allows workspaces to add custom fields to products, posts, categories...

- `create` / `update` / `archive` - CRUD custom fields
- `get` / `list` - Get custom fields
- `bindCustomFieldValues` - Bind custom field values to schema

---

## 8. Realtime & Events

### `events`
**Realtime event system.** Central hub for processing all system events, distributing to appropriate channels via WebSocket.

- `captureEvent` - Capture and distribute events
- `sendToWorkspace` / `sendToUser` - Send events to workspace/user via socket
- `get` / `list` - Event history
- Supports multiple `EventChannel`: WORKSPACE, USER, NONE

### `activities`
**Activity log.** Records comments, notes, and interactions within specific contexts (task, customer, loan...).

- `add` - Add activity (comment, log...)
- `update` - Update content
- `remove` - Delete activity
- `get` / `list` - Get activities (supports cursor-based pagination)
- Supports mentioning users in content

### `notifications`
**Push notifications.** Sends notifications to users via Firebase FCM (mobile/web).

- `create` / `createMultiple` - Create notification for one or multiple users
- `send` - Send push notification via Firebase FCM
- `list` - Notification history
- `markRead` / `markAllRead` - Mark as read
- `getStat` - Unread notification statistics

### `messages`
**Messages in message boxes.** Stores messages within message boxes.

- `addMessage` - Add message (text, attachment, image...)
- `list` - List messages
- `syncStatus` - Sync message status (PENDING -> SENT)

### `message-boxes`
**Conversation boxes.** Manages conversations with customers from multiple channels (Zalo OA, Facebook Messenger, Chat widget...).

- `create` / `getOrCreate` - Create/get message box
- `get` / `list` - Get message boxes
- `sendMemberTextMessage` / `sendMemberImageMessage` / `sendMemberFileMessage` - Staff sends messages
- `addMessageToBox` - Add message to box (handles multi-platform)
- Supports `MessageBoxPlatformType`: ZALO, FACEBOOK, WIDGET

### `reactions`
**Reactions/Emojis.** Emoji reaction system for entities.

- `add` / `remove` - Add/remove reaction
- `list` / `getEntityReactions` / `getEntityReactionsCount` - Get reactions

### `subscriptions`
**GraphQL Subscriptions.** Handles real-time subscriptions and manages system service plans.

- `create` / `update` / `get` / `remove` / `list` - Manage subscription plans (system pricing)
- `setDefault` / `setPrivate` - Set default/private plan
- `getDefault` - Get default plan

---

## 9. Reports

### `reports`
**Aggregated reports.** Aggregates and stores time-based reports for workspaces.

- `get` / `list` - Get reports
- `sync` - Sync reports for a time range
- `syncWorkspaceReports` - Sync all workspace reports
- `exportTimeSeries` - Export time series reports (customers, receipts, bookings, tasks, loans, orders)
- `combineTimeSeries` - Combine multiple reports into time series
- `combineMetrics` - Combine metrics (newToday, total...)
- `purge` - Delete old reports

---

## 10. Utilities

### `tasks`
**Task management.** Full-featured task system with custom statuses, timeline, and assignments.

- `create` / `update` / `archive` / `duplicate` - CRUD tasks
- `get` / `list` - Get tasks (supports multiple contexts)
- `bulkUpdate` - Bulk update
- `getStatuses` / `updateStatuses` - Manage custom task statuses
- `getMetrics` / `syncMetrics` - Metrics statistics
- `timeSeriesReport` / `metricsReport` - Reports
- Supports `TaskContextType`: WORKSPACE, CUSTOMER, LOAN, RECEIPT, BOOKING...

### `scheduling`
**Cron jobs for workspace.** Automates recurring tasks for each workspace.

- `registerWorkspaceSchedule` - Register cron jobs for workspace
- `registerJob` / `getJob` - Manage cron jobs
- Automated jobs:
  - Appointment reminders N days before (Zalo ZNS, notification)
  - Auto-generate electronic invoices
  - Auto-reject overdue loan applications
  - Monthly subscription payments
  - Customer birthday greetings

### `files`
**File/media management.** Upload, store, and serve files. Supports local storage and external storage (S3, R2).

- `upload` / `uploadExternal` - Upload new file / to external storage
- `signUpload` - Generate signed URL for direct S3 upload
- `get` / `list` - Get files
- `remove` - Delete file
- `stream` - Stream file (supports range requests)
- `getWorkspaceCapacity` - Calculate used storage capacity

### `links`
**URL shortener.** Create short URLs with custom or random slugs.

- `create` - Create shortened link
- `get` / `getBySlug` - Get link
- `list` - List links

### `locations`
**Vietnam administrative addresses.** Province/district/ward data and address utilities.

- `listProvinces` / `listDistricts` / `listWards` - List administrative regions
- `get` / `search` - Find locations
- `renderVnLocation` - Render full address

### `search`
**Full-text search (Elasticsearch).** Indexes multiple entity types.

- `search` - General search (customers, tasks, loans, receipts, orders, products, partners, members...)
- `searchEntity` - Search within a specific entity type
- `index` - Index an entity into Elasticsearch

### `partners`
**Partner management.** Manages workspace business partners.

- `create` / `update` / `archive` - CRUD partners
- `get` / `getWithCache` / `list` - Get partners

### `bank-transactions`
**Bank transactions / payments.** Manages transfer transactions, integrated with PayOS payment gateway.

- `create` - Create new transaction (auto-generates code)
- `get` / `list` - Get transactions
- `createPaymentLink` - Create payment link (PayOS)
- `callback` - Handle payment gateway callback
- `archive` - Cancel transaction

### `devices`
**Device management.** Stores user device info (mobile/web) for push notifications.

- `register` - Register new device (idempotent)
- `setNotificationToken` - Update FCM token
- `setUserId` / `setWorkspaceId` - Link device to user/workspace
- `getByUserId` / `getByIds` - Get devices

### `attendance`
**Attendance tracking.** Employee attendance management with multiple methods.

- `record` - Record attendance (QR, GPS, Manual)
- `list` - List attendance records
- `getMemberAttendanceRecordsForToday` - Today's attendance for a member
- `approve` / `reject` - Approve/reject manual attendance
- `getSetting` / `updateSetting` - Attendance settings (work hours, location...)

### `times`
**Timezones.** Provides global timezone list.

- `list` - Return timezone list (ID, name, UTC offset)

### `tools`
**Utility tools.**

- `excelToJson` - Convert Excel file to JSON
- `detectQrCode` - Read QR code from uploaded image

---

## 11. Infrastructure

### `cache`
**Redis cache.** Cache management service for the entire system.

- `get` / `set` / `clear` / `reset` - CRUD cache
- `instance` - Create CacheInstance by namespace (supports in-memory fallback)
- Auto-reconnects when Redis connection is lost

### `database`
**Database connection and transactions.** Manages MongoDB and PostgreSQL connections.

- `runTransaction` - Run PostgreSQL transaction (supports nested transactions)
- Supports `onCommitted` / `onRolledBack` callbacks
- `withMongoQuery` / `withPostgresQuery` - Query builder helpers from request params

### `queue-producers`
**Job queue producers (BullMQ).** Middleware service to push all background jobs into Redis/BullMQ queues.

- `captureEvent` - Process and distribute events
- `sendNotification` - Send push notifications
- `sendMail` - Send emails
- `searchIndex` - Index into Elasticsearch
- `syncReport` / `syncWorkspaceReports` / `exportTimeSeriesReport` - Reports
- `aiAssistantResponseMessageBox` - AI assistant response
- `forwardMetaWebhooks` - Forward Meta/Facebook webhooks
- `createProductVoucher` - Create vouchers
- `syncReceipt` / `syncLoan` / `syncOrder` / `syncTask` - Data sync
- `rejectPendingLoans` / `healthCheckLoans` - Loan processing
- `notifyZaloGmfGroup` - Notify via Zalo GMF Group
- `zaloOaZnsNewBooking` - Send ZNS booking notifications
- `pluginEInvoicesCreateInvoice` - Create electronic invoices

### `queue-consumers`
**Job queue consumers (BullMQ).** Consumers that listen and process jobs from queues.

- `CaptureEventConsumer` - Process and distribute events
- `SendNotificationConsumer` - Send FCM notifications
- `SendMailConsumer` - Send emails
- `SearchIndexConsumer` - Index Elasticsearch
- `SyncReportConsumer` / `ExportTimeSeriesReportConsumer` - Reports
- `AiAssistantResponseMessageBoxConsumer` - AI message box response
- `ForwardMetaWebhooksConsumer` - Process Facebook/Meta webhooks
- `SyncReceiptConsumer` / `SyncLoanConsumer` / `SyncOrderConsumer` / `SyncTaskConsumer` - Data sync
- `RejectPendingLoansConsumer` / `HealthCheckLoansConsumer` - Loan processing

### `config`
**Application configuration.** Loads environment variables and system config (DB URLs, API keys, JWT secrets...).

### `lang`
**Internationalization (i18n).** Multi-language support for notifications and UI.

- `translate` - Translate key to specified language
- Supported locales: `vi` (Vietnamese), `en` (English)

### `helpers`
**System utilities.** Controller providing utility endpoints for clients (health check, config...).

### `meta`
**Meta Graph API Client.** Client for calling Facebook/Meta Graph API.

- `get` / `post` / `patch` / `delete` - HTTP methods to Graph API

### `portal`
**Workspace portal.** Public landing page / portal for workspace.

### `setup`
**System initialization.** Initial setup endpoints (create admin, initial configuration).

### `throttler`
**Request rate limiting.** Rate limiting to protect API from abuse.

### `graphql`
**GraphQL configuration.** Contains custom GraphQL scalar types (Date, JSON...).

### `assets`
**Static assets.** Contains fonts and static files (used to generate workspace cover images with Jimp).

---

## 12. Plugins

### `plugin-ai-assistants`
**AI Assistant.** Integrates AI chatbots (OpenAI, Gemini...) to auto-respond to customer messages.

- `create` / `update` / `archive` - Configure AI assistant
- `get` / `list` - Get assistants
- `responseMessageBox` - AI auto-responds to message box
- `syncInfo` - Sync info from AI provider

### `plugin-banks`
**Vietnam bank information.** Integrates VietQR API for bank information.

- `getListBankInformations` - Get Vietnam bank list (cached 30 days)
- `getBankInformation` - Get bank info by ID
- `getBankAccountInformation` - Look up account holder name by account number and BIN

### `plugin-e-invoices`
**Electronic invoices.** Integrates with e-invoice providers (VIETTEL, MISA...) for automatic invoice generation.

- `createProvider` / `updateProvider` / `archiveProvider` - Manage providers
- `getProviders` / `getProvider` - Get providers
- `createInvoice` - Create electronic invoice
- `getInvoices` / `getInvoice` - Get invoice list/details
- `createTemplate` / `updateTemplate` - Manage invoice templates
- `generateEInvoiceData` - Generate invoice data from receipt/loan
- `cancelInvoice` - Cancel invoice

### `plugin-external-storage`
**External storage (S3/R2).** Configure workspace to use its own S3-compatible storage.

- `get` / `set` - Get/set external storage configuration
- `toggleDisable` - Enable/disable external storage
- `signUploadUrl` - Sign URL for direct bucket upload
- `verifyDna` - Verify file was uploaded successfully
- `proxy` - Proxy files from external storage

### `plugin-mailer`
**Email sending.** Email system with MJML templates, supports workspace custom SMTP.

- `sendUserWithTemplate` / `sendWorkspaceWithTemplate` - Send email with template
- `send` - Send plain email
- `renderUserTemplate` / `renderWorkspaceTemplate` - Render HTML from MJML
- `queue` - Push email job to queue
- Supported templates: appointments, credit notifications, password reset...

### `plugin-message-hubs`
**Message Hub (embedded chat widget).** Integrates with external Message Hub service to embed chat widgets into websites.

- `create` / `update` / `archive` / `get` / `list` - Manage message hubs
- `sendMessage` - Send message via hub
- `handleWebhook` - Receive and process webhooks from Message Hub

### `plugin-meta-pages`
**Facebook/Instagram Pages.** Connect Facebook Pages to receive and send Messenger messages.

- `connectPages` / `disconnectPage` - Connect/disconnect Facebook pages
- `getByWorkspaceId` / `get` / `getByPageId` - Get page information
- `handleWebhook` - Process Meta webhooks (new messages, delivery, read...)
- `sendTextMessage` / `sendImageMessage` / `sendFileMessage` - Send messages

### `plugin-zalo-oas`
**Zalo Official Account.** Connect Zalo OA to receive/send messages and send ZNS (Zalo Notification Service).

- `connect` / `connectCallback` / `disconnect` - Connect Zalo OA (OAuth PKCE flow)
- `update` - Update OA settings
- `getByWorkspaceId` / `get` / `getByPageId` - Get OA
- `refreshToken` - Auto-refresh access token
- `sendTextMessage` / `sendImageMessage` / `sendFileMessage` - Send messages
- `sendZns` - Send ZNS messages (template notifications)
- `handleWebhook` - Process Zalo webhooks (messages, follow, unfollow...)
- `getAccountPhoneFromToken` - Get customer phone number from Zalo token
- `sendGmfGroupMessage` - Send GMF group messages

---

> Total: **70+ modules** | Auto-generated on 2026-03-29
