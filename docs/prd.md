# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Fine Gold Africa

### 1.2 Application Description
A secure digital gold exchange platform serving both B2B and consumer markets, enabling users to trade physical gold products (bars, nuggets, dust, bulk supply) with institutional-grade security, real-time market pricing, and complete traceability of ethically sourced African gold assets.

---

## 2. Users and Usage Scenarios

### 2.1 Target Users
- Corporate traders and institutional buyers
- Individual gold investors and collectors
- Verified clients seeking certified purity gold products (96%-99.99%)

### 2.2 Core Usage Scenarios
- Browse and purchase physical gold products at live market rates
- Track personal gold asset portfolio and vault holdings
- Complete secure KYC verification for trading authorization
- Execute buy/sell transactions with real-time price calculation

---

## 3. Page Structure and Functional Description

### 3.1 Page Hierarchy

```
Fine Gold Africa Platform
├── Public Pages
│   ├── Home Page
│   ├── Product Catalog Page
│   ├── About/Trust & Sourcing Page
│   ├── Registration Page
│   └── Login Page
└── Authenticated User Portal
    ├── Dashboard
    ├── Product Purchase Flow
    ├── KYC Verification Page
    ├── Wallet & Portfolio Page
    └── Order History Page
```

### 3.2 Public Pages

#### 3.2.1 Home Page
- Display Fine Gold Africa logo (https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260704/Gemini_Generated_Image_485gui485gui485g(1).png) in header
- Hero section featuring animated 3D metallic visualization of African continent
- Live Purity & Market Price Ticker displaying real-time 24K gold prices per ounce and gram
- Navigation to Product Catalog, Trust & Sourcing, Registration/Login

#### 3.2.2 Product Catalog Page
- Display four product categories in card-based layout:
  - Gold Bars (Refined Bullion)
  - Gold Nuggets (High-Purity Raw Form)
  - Gold Dust (Alluvial Composition)
  - Bulk Gold Supply
- Each product card shows:
  - Product image and name
  - Purity percentage range
  - Real-time \"Calculate Cost\" interaction based on live market feed
  - \"Add to Cart\" or \"Buy Now\" action (requires login)

#### 3.2.3 About/Trust & Sourcing Page
- Corporate grid showcasing operational model:
  - 100% Traceability
  - Ethically Sourced African Assets
  - Certified Purity ranging from 96% to 99.99%
- Each grid item opens sliding panel with detailed compliance information

#### 3.2.4 Registration Page
- User inputs email, password, account type (Corporate/Individual)
- Submit registration to create account

#### 3.2.5 Login Page
- User inputs email and password
- Authenticate and redirect to Dashboard

### 3.3 Authenticated User Portal

#### 3.3.1 Dashboard
- Display user's gold asset portfolio with interactive graphical charts showing performance over time
- Show secure vault allocation weights (ounces/grams)
- Display current cash balance
- Show KYC verification status
- Quick access to Purchase, Wallet, Order History

#### 3.3.2 Product Purchase Flow
- User selects product from catalog
- System displays live market price and calculates total cost including 1.5% processing fee
- User specifies weight/quantity
- System validates KYC approval status before allowing checkout
- If KYC approved: proceed to payment via Stripe or bank wire invoice
- If KYC not approved: display message directing user to complete KYC verification
- Upon successful payment, generate order confirmation with reference code

#### 3.3.3 KYC Verification Page
- User uploads Government ID or Trading License documents
- System stores document paths securely
- Display verification status: Pending, Approved, or Rejected
- Show audit trail of verification process

#### 3.3.4 Wallet & Portfolio Page
- Display detailed breakdown of gold holdings by product type
- Show total ounces/grams owned
- Display cash balance available for transactions
- Provide option to liquidate (sell) gold holdings at current market rate

#### 3.3.5 Order History Page
- List all past transactions with details:
  - Transaction type (Buy/Sell)
  - Product name and weight
  - Execution price and timestamp
  - Confirmation reference code
  - Processing status

---

## 4. Business Rules and Logic

### 4.1 KYC Enforcement
- No user can execute buy or sell orders unless KYC verification status is \"Approved\"
- System must block checkout flow and display verification requirement message for non-approved users

### 4.2 Pricing and Fee Calculation
- All product prices dynamically calculated based on live gold market spot rates
- 1.5% institutional processing fee applied to all transactions
- Final cost = (Weight × Live Market Price per Unit) × 1.015

### 4.3 Transaction Processing
- Buy orders: Deduct payment amount, add gold weight to user's vault holdings, generate order record
- Sell orders: Deduct gold weight from vault, add proceeds (minus fee) to cash balance, generate order record
- All transactions logged with exact timestamp and market price at execution

### 4.4 Live Market Data Integration
- Platform continuously receives live gold spot rates from global commodity exchange API
- Prices update in real-time across all pages (Home ticker, Product catalog, Purchase flow)

### 4.5 Payment Processing
- Integrate Stripe for card payments
- Generate bank wire invoices for institutional clients
- Payment confirmation triggers order fulfillment workflow

---

## 5. Exceptions and Boundary Cases

| Scenario | System Behavior |
|----------|------------------|
| User attempts purchase without KYC approval | Block checkout, display \"Complete KYC verification to proceed\" message |
| Live market API unavailable | Display last known price with timestamp, disable purchase until connection restored |
| Payment processing fails | Rollback transaction, notify user, retain cart contents |
| User uploads invalid KYC document format | Reject upload, display supported format requirements |
| Insufficient cash balance for sell order processing fee | Block sell transaction, display insufficient balance message |
| User attempts to sell more gold than vault holdings | Block transaction, display available holdings limit |

---

## 6. Acceptance Criteria

1. User registers account and logs in successfully
2. User navigates to Product Catalog and views live gold prices updating in real-time
3. User uploads KYC documents and receives \"Approved\" status
4. User selects Gold Bars product, specifies 10 ounces, system calculates total cost with 1.5% fee based on live market rate
5. User completes payment via Stripe, receives order confirmation with reference code
6. User views Dashboard showing 10 ounces of Gold Bars in vault holdings with portfolio chart
7. User navigates to Order History and sees completed purchase transaction with all details

---

## 7. Features Not Included in This Release

- Multi-currency support beyond primary payment currency
- Automated gold price alerts or notifications
- Peer-to-peer gold trading between users
- Physical delivery scheduling and logistics tracking
- Mobile native applications (iOS/Android)
- Advanced portfolio analytics (ROI calculations, tax reporting)
- Social features (sharing, referrals, community forums)
- Subscription or membership tier programs
- Automated trading bots or algorithmic trading features
- Integration with external wallet providers or blockchain systems