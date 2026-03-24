import 'package:flutter/material.dart';

import 'match_confirmation_screen.dart';
import 'venue_selection_screen.dart';

class CreateMatchScreen extends StatefulWidget {
  const CreateMatchScreen({super.key});

  @override
  State<CreateMatchScreen> createState() => _CreateMatchScreenState();
}

class _CreateMatchScreenState extends State<CreateMatchScreen> {
  int _sport = 0;
  int _skill = 1;
  bool _isPublic = true;
  String _venue = 'Select Venue';

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Center(
              child: Text('Create Match',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 20)),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              height: 46,
              decoration: BoxDecoration(
                color: const Color(0xFF12203B),
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              alignment: Alignment.centerLeft,
              child: const Text('e.g. Friendly 5-a-side', style: TextStyle(color: Color(0xFF6E7F9F))),
            ),
            const SizedBox(height: 16),
            const Text('Select Sport', style: TextStyle(color: Color(0xFF9AA8C0), fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: [
                _sportChip(Icons.sports_soccer, 'Football', 0),
                const SizedBox(width: 8),
                _sportChip(Icons.sports_cricket, 'Cricket', 1),
                const SizedBox(width: 8),
                _sportChip(Icons.sports_tennis, 'Tennis', 2),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Skill Level', style: TextStyle(color: Color(0xFF9AA8C0), fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: [
                _skillChip('Beginner', 0),
                const SizedBox(width: 8),
                _skillChip('Intermediate', 1),
                const SizedBox(width: 8),
                _skillChip('Pro', 2),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: const [
                Expanded(child: _StaticField(label: 'Date', value: '10/24/2023')),
                SizedBox(width: 10),
                Expanded(child: _StaticField(label: 'Time', value: '06:00 PM')),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Venue', style: TextStyle(color: Color(0xFF9AA8C0), fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            InkWell(
              onTap: () async {
                final selected = await Navigator.of(context).push<String>(
                  MaterialPageRoute(builder: (_) => const VenueSelectionScreen()),
                );
                if (selected != null && selected.isNotEmpty) {
                  setState(() => _venue = selected);
                }
              },
              child: Container(
                height: 54,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF12203B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF203656)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.location_on, color: Color(0xFF2FA4FF), size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_venue,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                    ),
                    const Icon(Icons.chevron_right, color: Color(0xFF8FA0BF)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              height: 52,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF12203B),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF203656)),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Public Match', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                        Text('Allow anyone to request to join', style: TextStyle(color: Color(0xFF8FA0BF), fontSize: 11)),
                      ],
                    ),
                  ),
                  Switch(
                    value: _isPublic,
                    onChanged: (v) => setState(() => _isPublic = v),
                    activeThumbColor: const Color(0xFF2FA4FF),
                  )
                ],
              ),
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: const LinearGradient(colors: [Color(0xFF1F78FF), Color(0xFF2FA4FF)]),
                ),
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const MatchConfirmationScreen()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.add, color: Colors.white),
                  label: const Text('Create Match', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sportChip(IconData icon, String text, int value) {
    final selected = _sport == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _sport = value),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          height: 68,
          decoration: BoxDecoration(
            color: selected ? const Color(0xFF2A8CFF) : const Color(0xFF12203B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: selected ? const Color(0xFF2A8CFF) : const Color(0xFF203656)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 18),
              const SizedBox(height: 4),
              Text(text, style: const TextStyle(color: Colors.white, fontSize: 11)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _skillChip(String text, int value) {
    final selected = _skill == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _skill = value),
        child: Container(
          alignment: Alignment.center,
          height: 34,
          decoration: BoxDecoration(
            color: selected ? const Color(0xFF2A8CFF) : const Color(0xFF12203B),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: selected ? const Color(0xFF2A8CFF) : const Color(0xFF203656)),
          ),
          child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
        ),
      ),
    );
  }
}

class _StaticField extends StatelessWidget {
  final String label;
  final String value;
  const _StaticField({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF12203B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF203656)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF8FA0BF), fontSize: 11)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
