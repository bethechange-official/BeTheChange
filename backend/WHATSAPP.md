# WhatsApp order alerts

Every new order is sent automatically to the admin's WhatsApp (**+91 63008 36017**) with the full order
details. The customer does nothing. Orders are saved and shown in the admin panel exactly as before, and
each order shows its WhatsApp status (sent, failed with the reason, or not set up) with a **Resend** button.

A WhatsApp problem never blocks or fails an order.

It uses Meta's official **WhatsApp Business Cloud API**. Until the two credentials below are set, it stays
off and admin shows "Not sent — WhatsApp not set up".

## One-time setup (Meta)

1. **Meta Business account**: create one at business.facebook.com (business verification is needed for
   production volumes).
2. **App + WhatsApp**: at developers.facebook.com create an app of type *Business*, then add the
   **WhatsApp** product.
3. **Sender number**: in *WhatsApp → API Setup*, add and verify the phone number the alerts will come
   **from**. It must be a number that is **not** already on the WhatsApp/WhatsApp Business app. It can't be
   6300836017 itself, because that's the number receiving the alerts.
   Copy its **Phone number ID** (a long number, not the phone number).
4. **Permanent access token**: in *Business Settings → System users*, create a system user, give it the
   WhatsApp app with `whatsapp_business_messaging` permission, and generate a token (no expiry).
   The temporary token on the API Setup page expires after 24 hours.
5. **Message template**: in *WhatsApp Manager → Message templates*, create:
   - Name: `new_order_alert`
   - Category: **Utility**
   - Language: **English** (`en`)
   - Body (exactly 8 variables, in this order):

     ```
     New order {{1}}
     Customer: {{2}}
     Contact: {{3}}
     Deliver to: {{4}}
     Items: {{5}}
     {{6}}
     Total: {{7}} ({{8}})
     ```

     | Variable | Filled with | Example |
     |---|---|---|
     | {{1}} | Order number | BTC-MUS069IS-461BB757 |
     | {{2}} | Customer name | Test Customer |
     | {{3}} | Phone · email | 9876543210 · customer@example.com |
     | {{4}} | Delivery address | 12 Botanical Avenue, Hyderabad, Telangana 500033 |
     | {{5}} | Items | 2 × Strawberry Lip Balm (₹498); 1 × Face Cream (₹399) |
     | {{6}} | Charges | Subtotal ₹897 · Coupon FLAT50 −₹50 · Shipping ₹50 |
     | {{7}} | Total | ₹897 |
     | {{8}} | Payment | Cash on Delivery |

   Submit it and wait for approval (usually minutes).

## Configure the backend

Add to `backend/.env` (and to the production server's environment), then restart the backend:

```
WHATSAPP_ACCESS_TOKEN=<permanent token from step 4>
WHATSAPP_PHONE_NUMBER_ID=<phone number ID from step 3>
ADMIN_WHATSAPP_NUMBER=916300836017
WHATSAPP_MESSAGE_MODE=template
WHATSAPP_ORDER_TEMPLATE=new_order_alert
WHATSAPP_TEMPLATE_LANGUAGE=en
```

`ADMIN_WHATSAPP_NUMBER` is the receiving number with country code and no `+` or spaces.

## Check it works

Place a test order, then open it in **Admin → Orders**. The WhatsApp box should say
**"Sent to admin WhatsApp"**. If it says **Failed**, the box shows Meta's reason. Common ones:

| Reason | Fix |
|---|---|
| `Template name does not exist` (132001) | Template not approved yet, or name/language differ from the env values. |
| `Recipient phone number not in allowed list` (131030) | Meta test numbers can only message numbers added under *API Setup → To*. Add 6300836017 there, or use a production number. |
| `Authentication Error` / 401 | Token expired or wrong. Use a permanent system-user token. |
| `Number of parameters does not match` (132000) | The template body must have exactly the 8 variables above. |

After fixing, press **Retry** on the order. There's no need to place a new one.

## Text mode (optional)

`WHATSAPP_MESSAGE_MODE=text` sends a nicer multi-line message without a template, but WhatsApp only delivers
it if the admin number has messaged the business number in the last 24 hours. Use `template` for reliable
alerts.

## Costs

Meta charges per business-initiated "utility" conversation. At the time of writing, India's rate is a small
fraction of a rupee per conversation. Check *WhatsApp Manager → Insights* for current pricing.
