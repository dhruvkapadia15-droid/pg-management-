<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $guarded = [];
    public function room() { return $this->belongsTo(Room::class); }
    public function payments() { return $this->hasMany(Payment::class); }
}
