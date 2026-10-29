<?php
namespace App\Http\Controllers;

use App\Models\{Room, Tenant, Payment};
use Illuminate\Http\Request;
use SimpleXMLElement;

class PgController extends Controller
{
    // One config drives list pages, forms and validation for all three modules.
    private function cfg(string $type): array
    {
        return [
            'rooms' => ['model' => Room::class, 'title' => 'Rooms', 'with' => [],
                'fields' => ['room_no' => 'text', 'type' => ['Single', 'Double', 'Triple'], 'rent' => 'number', 'capacity' => 'number']],
            'tenants' => ['model' => Tenant::class, 'title' => 'Tenants', 'with' => ['room'],
                'fields' => ['name' => 'text', 'phone' => 'text', 'room_id' => Room::pluck('room_no', 'id')->all(), 'joined_on' => 'date']],
            'payments' => ['model' => Payment::class, 'title' => 'Rent payments', 'with' => ['tenant'],
                'fields' => ['tenant_id' => Tenant::pluck('name', 'id')->all(), 'amount' => 'number', 'month' => 'month', 'status' => ['Paid', 'Pending']]],
        ][$type];
    }

    public function dashboard()
    {
        $beds = Room::sum('capacity');
        return view('dashboard', [
            'rooms' => Room::count(),
            'tenants' => Tenant::count(),
            'beds' => $beds,
            'free' => max(0, $beds - Tenant::count()),
            'collected' => Payment::where('status', 'Paid')->sum('amount'),
            'pending' => Payment::where('status', 'Pending')->sum('amount'),
            'recent' => Payment::with('tenant')->latest()->take(5)->get(),
        ]);
    }

    public function index(string $type)
    {
        $c = $this->cfg($type);
        return view('list', ['type' => $type, 'c' => $c, 'rows' => $c['model']::with($c['with'])->latest()->get()]);
    }

    public function store(Request $r, string $type)
    {
        $c = $this->cfg($type);
        $rules = collect($c['fields'])->map(fn($f) => 'required')->all();
        $c['model']::create($r->validate($rules));
        return back()->with('ok', 'Saved.');
    }

    public function destroy(string $type, int $id)
    {
        $c = $this->cfg($type);
        $c['model']::findOrFail($id)->delete();
        return back()->with('ok', 'Deleted.');
    }

    // XML in: house rules loaded from an XML file
    public function rules()
    {
        $xml = simplexml_load_file(public_path('xml/rules.xml'));
        return view('rules', ['pg' => (string) $xml['name'], 'rules' => $xml->rule]);
    }

    // XML out: tenant register as an XML download
    public function exportXml()
    {
        $xml = new SimpleXMLElement('<tenants/>');
        foreach (Tenant::with('room')->get() as $t) {
            $n = $xml->addChild('tenant');
            $n->addChild('name', e($t->name));
            $n->addChild('phone', e($t->phone));
            $n->addChild('room', e($t->room->room_no ?? ''));
            $n->addChild('joined_on', $t->joined_on);
        }
        return response($xml->asXML(), 200, ['Content-Type' => 'application/xml']);
    }
}
