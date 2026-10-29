@extends('layouts.app')
@section('title', 'House rules')
@section('content')
<h2>House rules at {{ $pg }}</h2>
<ol class="rules">
    @foreach($rules as $r) <li>{{ $r }}</li> @endforeach
</ol>
<p class="muted">Edit these in <code>public/xml/rules.xml</code>.</p>
@endsection
