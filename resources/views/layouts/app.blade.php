<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'PG Manager')</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
<aside>
    <h1>PG Manager</h1>
    <nav>
        <a href="{{ route('dashboard') }}" class="{{ request()->is('/') ? 'on' : '' }}">Dashboard</a>
        <a href="{{ route('list','rooms') }}" class="{{ request()->is('rooms') ? 'on' : '' }}">Rooms</a>
        <a href="{{ route('list','tenants') }}" class="{{ request()->is('tenants') ? 'on' : '' }}">Tenants</a>
        <a href="{{ route('list','payments') }}" class="{{ request()->is('payments') ? 'on' : '' }}">Payments</a>
        <a href="{{ route('rules') }}" class="{{ request()->is('rules') ? 'on' : '' }}">House rules</a>
        <a href="{{ route('export') }}">Export tenants (XML)</a>
    </nav>
</aside>
<main>
    @if(session('ok')) <div class="flash">{{ session('ok') }}</div> @endif
    @if($errors->any()) <div class="flash err">Please fill in every field.</div> @endif
    @yield('content')
</main>
<script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
