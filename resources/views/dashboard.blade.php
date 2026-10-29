@extends('layouts.app')
@section('title', 'Dashboard')
@section('content')
<h2>Today at your PG</h2>
<div class="stats">
    <div class="stat big"><b>{{ $free }}</b><span>beds free out of {{ $beds }}</span></div>
    <div class="stat"><b>{{ $rooms }}</b><span>rooms</span></div>
    <div class="stat"><b>{{ $tenants }}</b><span>tenants</span></div>
    <div class="stat"><b>₹{{ number_format($collected) }}</b><span>rent collected</span></div>
    <div class="stat warn"><b>₹{{ number_format($pending) }}</b><span>rent pending</span></div>
</div>
<h3>Latest payments</h3>
<table>
    <tr><th>Tenant</th><th>Month</th><th>Amount</th><th>Status</th></tr>
    @forelse($recent as $p)
        <tr><td>{{ $p->tenant->name ?? '-' }}</td><td>{{ $p->month }}</td><td>₹{{ number_format($p->amount) }}</td>
            <td><span class="tag {{ $p->status }}">{{ $p->status }}</span></td></tr>
    @empty
        <tr><td colspan="4" class="empty">No payments yet. Add a room and a tenant, then record the first rent.</td></tr>
    @endforelse
</table>
@endsection
