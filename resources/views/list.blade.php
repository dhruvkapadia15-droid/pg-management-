@extends('layouts.app')
@section('title', $c['title'])
@section('content')
<h2>{{ $c['title'] }}</h2>

<form method="POST" action="{{ route('store', $type) }}" class="card">
    @csrf
    @foreach($c['fields'] as $name => $kind)
        <label>{{ ucfirst(str_replace(['_id','_'], ['',' '], $name)) }}
            @if(is_array($kind))
                <select name="{{ $name }}" required>
                    <option value="">Select</option>
                    @foreach($kind as $k => $v)
                        <option value="{{ array_is_list($kind) ? $v : $k }}">{{ $v }}</option>
                    @endforeach
                </select>
            @else
                <input type="{{ $kind }}" name="{{ $name }}" required value="{{ old($name) }}">
            @endif
        </label>
    @endforeach
    <button>Add {{ rtrim($type, 's') }}</button>
</form>

<input id="search" placeholder="Search {{ strtolower($c['title']) }}">
<table id="data">
    <tr>
        @foreach($c['fields'] as $name => $k) <th>{{ ucfirst(str_replace(['_id','_'], ['',' '], $name)) }}</th> @endforeach
        <th></th>
    </tr>
    @forelse($rows as $row)
        <tr>
            @foreach($c['fields'] as $name => $k)
                <td>
                    @if($name === 'room_id') {{ $row->room->room_no ?? '-' }}
                    @elseif($name === 'tenant_id') {{ $row->tenant->name ?? '-' }}
                    @elseif($name === 'status') <span class="tag {{ $row->status }}">{{ $row->status }}</span>
                    @else {{ $row->$name }} @endif
                </td>
            @endforeach
            <td>
                <form method="POST" action="{{ route('destroy', [$type, $row->id]) }}" class="del">
                    @csrf @method('DELETE')
                    <button class="link">Delete</button>
                </form>
            </td>
        </tr>
    @empty
        <tr><td colspan="{{ count($c['fields']) + 1 }}" class="empty">Nothing here yet. Use the form above to add the first entry.</td></tr>
    @endforelse
</table>
@endsection
