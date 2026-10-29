# PG Management System

A small, dependency-light **paying-guest (PG) hostel manager**: rooms, tenants and monthly rent
payments, a dashboard of beds free / rent collected / rent pending, house rules read from XML and a
tenant register exported as XML.

Stack: **Laravel + PHP 8.2** (Eloquent, Blade), HTML, CSS, vanilla JavaScript, XML.

- **Live demo (static, no PHP needed):** https://dhruvkapadia15-droid.github.io/pg-management-/
  — the same screens and data model running on `localStorage`, served from [`docs/`](docs).

## Screens

| Route | What it does |
| --- | --- |
| `/` | Dashboard: beds free, rooms, tenants, rent collected, rent pending, latest 5 payments |
| `/rooms` | List + add + delete rooms (room no, type, rent, capacity) |
| `/tenants` | List + add + delete tenants (name, phone, room, joined on) |
| `/payments` | List + add + delete rent payments (tenant, amount, month, status) |
| `/rules` | House rules parsed from `public/xml/rules.xml` |
| `/export/tenants.xml` | Tenant register as an XML download |

All three list screens share one config in `PgController` (`cfg()`), so field lists, the add form,
validation and table headers stay in sync. Every list page has live search, confirm-before-delete
and flash messages.

## Data model

```
rooms     id, room_no (unique), type, rent, capacity, timestamps
tenants   id, name, phone, room_id -> rooms (cascade delete), joined_on, timestamps
payments  id, tenant_id -> tenants (cascade delete), amount, month, status, timestamps
```

`payments.status` is `Paid` or `Pending` — those two sum into "rent collected" and "rent pending".

## Project layout

```
app/Http/Controllers/PgController.php   controller: dashboard, generic list/store/destroy, XML in/out
app/Models/{Room,Tenant,Payment}.php    Eloquent models and relationships
database/migrations/                    the three tables above
resources/views/                        Blade layout, dashboard, list, rules
routes/web.php                          all routes
public/css/style.css                    styling (light + dark, responsive)
public/js/app.js                        live search, delete confirm, flash auto-hide
public/xml/rules.xml                    house rules data
docs/                                   static GitHub Pages demo of the same app
```

## Running the Laravel app

Needs PHP 8.2+ and Composer.

```bash
composer create-project laravel/laravel pg-app
# copy routes/, app/, database/, resources/, public/ from this repo into pg-app/, overwriting
cd pg-app
php artisan migrate     # SQLite by default; say yes if asked to create the DB file
php artisan serve       # http://127.0.0.1:8000
```

Add rooms first, then tenants, then payments — the form dropdowns read from the tables above them.

## House rules (XML in) and export (XML out)

- Edit `public/xml/rules.xml`; the `<pg name="...">` attribute is the PG name and each `<rule>`
  becomes a list item on `/rules`.
- `/export/tenants.xml` builds `<tenants><tenant><name/><phone/><room/><joined_on/></tenant>…</tenants>`
  and streams it as `application/xml`.

## The static demo in `docs/`

GitHub Pages can only serve static files, so `docs/` is a self-contained port of the Blade views:
same CSS, same table columns, same sorting (`latest` first), same search/delete/confirm behaviour,
same XML rules and XML export. Data is seeded into `localStorage` on first load; clear the
`pgm_demo_v1` key to reset it.

To publish it, in the repo: **Settings → Pages → Source: Deploy from a branch → `main` / `/docs`**.
