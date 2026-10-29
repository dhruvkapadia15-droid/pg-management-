<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PgController;

Route::get('/', [PgController::class, 'dashboard'])->name('dashboard');
Route::get('/rules', [PgController::class, 'rules'])->name('rules');          // reads public/xml/rules.xml
Route::get('/export/tenants.xml', [PgController::class, 'exportXml'])->name('export');
Route::get('/{type}', [PgController::class, 'index'])->whereIn('type', ['rooms','tenants','payments'])->name('list');
Route::post('/{type}', [PgController::class, 'store'])->whereIn('type', ['rooms','tenants','payments'])->name('store');
Route::delete('/{type}/{id}', [PgController::class, 'destroy'])->whereIn('type', ['rooms','tenants','payments'])->name('destroy');
