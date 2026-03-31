import 'package:flutter/material.dart';

class CreateMatchScreen extends StatefulWidget {
  const CreateMatchScreen({super.key});

  @override
  State<CreateMatchScreen> createState() => _CreateMatchScreenState();
}

class _CreateMatchScreenState extends State<CreateMatchScreen> {
  int _maxPlayers = 4;
  bool _hasEntryFee = false;
  double _entryFee = 0.0;
  int _selectedSkill = 1; // 0: Beginner, 1: Intermediate, 2: Pro
  int _selectedSport = 0; // sample index
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F8A66)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Create Match', style: TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w800)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: CircleAvatar(backgroundColor: Colors.grey[200], child: const Icon(Icons.person, color: Colors.black54)),
          )
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 6, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // hero banner
              Container(
                height: 120,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(colors: [Color(0xFF0F8A66), Color(0xFF0B6B5A)]),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Text('New Game,', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                          SizedBox(height: 6),
                          Text('New Connections', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                          SizedBox(height: 6),
                          Text('Set the stage for a perfect match.', style: TextStyle(color: Colors.white70)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(width: 80, height: 80, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.sports_basketball, color: Colors.white70, size: 40)),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              const Text('Choose Sport', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _sportChip('Tennis', 0),
                  const SizedBox(width: 8),
                  _sportChip('Basketball', 1),
                  const SizedBox(width: 8),
                  _sportChip('Football', 2),
                ],
              ),

              const SizedBox(height: 18),
              const Text('Location', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                child: const TextField(
                  decoration: InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search court or club name...', border: InputBorder.none),
                ),
              ),

              const SizedBox(height: 12),
              Container(
                height: 140,
                decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(12)),
                child: const Center(child: Icon(Icons.map, size: 64, color: Colors.white70)),
              ),

              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(child: _datePicker()),
                  const SizedBox(width: 12),
                  Expanded(child: _timePicker()),
                ],
              ),

              const SizedBox(height: 18),
              const Text('Max Players', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(onPressed: () { setState(() { if (_maxPlayers > 1) _maxPlayers--; }); }, icon: const Icon(Icons.remove_circle_outline, color: Colors.black54)),
                    const SizedBox(width: 12),
                    Text('$_maxPlayers', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                    const SizedBox(width: 12),
                    IconButton(onPressed: () { setState(() { _maxPlayers++; }); }, icon: const Icon(Icons.add_circle_outline, color: Color(0xFF0F8A66))),
                  ],
                ),
              ),

              const SizedBox(height: 18),
              const Text('Entry Fee', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        enabled: _hasEntryFee,
                        keyboardType: TextInputType.numberWithOptions(decimal: true),
                        decoration: InputDecoration(prefixText: ' ', hintText: '0.00', border: InputBorder.none),
                        onChanged: (v) { setState(() { _entryFee = double.tryParse(v) ?? 0.0; }); },
                      ),
                    ),
                    Switch(value: _hasEntryFee, onChanged: (v) => setState(() => _hasEntryFee = v)),
                  ],
                ),
              ),

              const SizedBox(height: 18),
              const Text('Required Skill Level', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _skillChip('Level 1\nBeginner', 0),
                  const SizedBox(width: 8),
                  _skillChip('Level 2\nIntermediate', 1),
                  const SizedBox(width: 8),
                  _skillChip('Level 3\nPro', 2),
                ],
              ),

              const SizedBox(height: 28),
              // large create button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _createMatch,
                  icon: const Icon(Icons.rocket_launch),
                  label: const Text('Create Match', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA5B2C), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sportChip(String label, int index) {
    final selected = _selectedSport == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedSport = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(color: selected ? const Color(0xFF0F8A66) : Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)),
        child: Text(label, style: TextStyle(color: selected ? Colors.white : Colors.black87, fontWeight: FontWeight.w700)),
      ),
    );
  }

  Widget _skillChip(String label, int index) {
    final selected = _selectedSkill == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedSkill = index),
      child: Container(
        width: 110,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: selected ? const Color(0xFF6B8DE3) : Colors.black12)),
        child: Column(
          children: [
            Text(label.split('\n')[0], style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
            const SizedBox(height: 6),
            Text(label.split('\n')[1], style: const TextStyle(color: Colors.black54, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _datePicker() {
    return GestureDetector(
      onTap: () async {
        final now = DateTime.now();
        final picked = await showDatePicker(context: context, initialDate: now, firstDate: now, lastDate: DateTime(now.year + 2));
        if (picked != null) {
          setState(() {
            _selectedDate = picked;
          });
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        child: Row(children: [const Icon(Icons.calendar_today_outlined, color: Colors.black54), const SizedBox(width: 12), Text(_selectedDate == null ? 'mm/dd/yyyy' : '${_selectedDate!.month}/${_selectedDate!.day}/${_selectedDate!.year}', style: const TextStyle(color: Colors.black54))]),
      ),
    );
  }

  Widget _timePicker() {
    return GestureDetector(
      onTap: () async {
        final now = TimeOfDay.now();
        final picked = await showTimePicker(context: context, initialTime: now);
        if (picked != null) {
          setState(() {
            _selectedTime = picked;
          });
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        child: Row(children: [const Icon(Icons.access_time, color: Colors.black54), const SizedBox(width: 12), Text(_selectedTime == null ? '--:-- --' : _selectedTime!.format(context), style: const TextStyle(color: Colors.black54))]),
      ),
    );
  }

  void _createMatch() {
    final feeText = _hasEntryFee ? '\$${_entryFee.toStringAsFixed(2)}' : 'Free';
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Match created (stub) • Players: $_maxPlayers • Fee: $feeText')));
  }
}
