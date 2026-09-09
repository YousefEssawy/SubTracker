# SubTracker

A personal finance tracker for two things a person pays for repeatedly: **subscriptions** they are billed for by outside vendors, and their own **transactions** organised into spaces and categories. These are deliberately two separate records of money — see the Ledgers section.

## Language

### Ledgers

The app keeps **two independent records of money that never combine**. Every money term below belongs to exactly one of them.

**Ledger**:
The user's own record of money in and out, made of Transactions. The only ledger the app treats as authoritative for income, expense, and balance.

**Transaction**:
A single income or expense entry in the Ledger, owned by the user. Always belongs to one Space and one Finance Category.
_Avoid_: entry, record, item

**Payment**:
A record that a Subscription was charged on a given date. Payments are **not** Transactions and never enter the Ledger — a Subscription has no Space and no Finance Category, so it cannot become a Transaction without inventing both.
_Avoid_: charge, bill, transaction

**Balance**:
Income minus expense across Transactions, per currency. It is a Ledger figure only: it excludes every Subscription the user tracks, so it is not the user's overall financial position. Anywhere it appears on screen, the Ledger it measures is named.
_Avoid_: net worth, total, account balance

### Recurring money

**Subscription**:
A recurring charge the user is billed for by an outside vendor — a name, a price, and a Renewal Date the user does not control. A Subscription *has* a recurring schedule; it is not a Recurrence.
_Avoid_: plan, service, membership

**Recurrence**:
A rule the user defines that generates Transactions on a schedule. It is bookkeeping the user owns, not a commitment to a vendor.
_Avoid_: repeat, schedule, recurring transaction, subscription

**Renewal Date**:
The next date a Subscription will be charged.

**Next Date**:
The next date a Recurrence will generate a Transaction. The Recurrence counterpart of a Renewal Date; the two are never the same field.
_Avoid_: next execution date, due date

**Billing Cycle**:
How often a Subscription renews — weekly, monthly, yearly, or a custom number of days. A Subscription concept only.
_Avoid_: frequency, period, pattern

**Recurrence Pattern**:
The base unit a Recurrence repeats on — daily, weekly, monthly, or yearly — combined with an Interval to express "every N units". A Recurrence concept only, and it has no custom variant: *custom* belongs to Billing Cycle.
_Avoid_: frequency, cycle, billing cycle

**Interval**:
The multiplier on a Recurrence Pattern. Pattern `weekly` with Interval `2` means every two weeks. At least 1.

### Organisation

**Space**:
A user-defined context that Transactions are grouped by — work, home, travel. Applies to Transactions and Recurrences only; Subscriptions have no Space.
_Avoid_: workspace, account, bucket, group

**Finance Category**:
A user-created grouping for Transactions, typed as either Income or Expense. Created and named by the user, one document per category.
_Avoid_: category (ambiguous — see Subscription Category), tag, label

**Subscription Category**:
One of a fixed, built-in set of vendor kinds a Subscription is filed under — streaming, software, gaming, and so on. Chosen from a closed list, never created by the user, and unrelated to a Finance Category despite the shared word.
_Avoid_: category (ambiguous — see Finance Category)

**Tag**:
A free-text lowercase keyword attached to a Transaction. Unlike a Finance Category, a Tag is not typed and not a stored entity.
_Avoid_: label, keyword

**Attachment**:
A single receipt file — image or PDF — attached to one Transaction.
_Avoid_: file, upload, document

### Status

**Active / Paused**:
Whether a Subscription or Recurrence is currently in effect. Paused is always a **reversible** state the user chose, or a safety stop the user can clear. A paused Subscription or Recurrence generates nothing while paused, and those skipped periods are not billed or back-filled when it resumes.

**Completed**:
A Recurrence that has run past its end date and will never generate again. Distinct from Paused: a Completed Recurrence is finished, not suspended, and resuming it is meaningless. Applies to Recurrences only.
_Avoid_: paused, ended, expired, finished

**Cancelled**:
A Subscription the user has ended. Applies to Subscriptions only — a Recurrence is deleted rather than cancelled.
_Avoid_: inactive, archived, deleted
