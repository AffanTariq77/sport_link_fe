import 'package:flutter/material.dart';

class TournamentDetailScreen extends StatelessWidget {
  const TournamentDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final title = args != null && args['title'] != null ? args['title'] as String : 'Tournament';

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Color(0xFF0F8A66)), onPressed: () => Navigator.of(context).pop()),
        title: const Text('Tournaments', style: TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w800)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Container(height: 180, color: Colors.blueGrey.shade200, child: const Center(child: Icon(Icons.photo, size: 72, color: Colors.white70))),
              ),
              const SizedBox(height: 12),
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 12),
              Row(children: const [
                Expanded(child: _InfoCard(icon: Icons.calendar_today_outlined, label: 'DATE', value: 'Oct 24 - 26')),
                SizedBox(width: 12),
                Expanded(child: _InfoCard(icon: Icons.money, label: 'PRIZE POOL', value: '\$2,500')),
              ]),
              const SizedBox(height: 16),
              const Text('About the Tournament', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              const Text('Join the elite regional circuit at the Kinetic Oasis. This year\'s Masters Invitational brings together the top 32 ranked players for a three-day knockout challenge. High-intensity matches, premium hospitality, and the coveted Emerald Trophy await.'),
              const SizedBox(height: 16),
              const Text('Tournament Rules', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Column(children: const [
                _RuleRow(number: '01', text: 'Single elimination bracket format. Best of 3 sets.'),
                SizedBox(height: 8),
                _RuleRow(number: '02', text: 'Standard ITF rules apply. Tie-break at 6-6 in all sets.'),
                SizedBox(height: 8),
                _RuleRow(number: '03', text: 'Players must check-in 30 mins prior to match start.'),
              ]),
              const SizedBox(height: 16),
              const Text('Bracket Preview', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              _bracketPreview(),
              const SizedBox(height: 16),
              const Text('Participants', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              Row(children: const [
                CircleAvatar(radius: 18, backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)),
                SizedBox(width: 6),
                CircleAvatar(radius: 18, backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)),
                SizedBox(width: 6),
                CircleAvatar(radius: 18, backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)),
                SizedBox(width: 6),
                CircleAvatar(radius: 18, backgroundColor: Colors.green, child: Text('+20', style: TextStyle(color: Colors.white))),
              ]),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA5B2C), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))),
                  child: const Text('Join Tournament', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bracketPreview() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
          child: Column(children: const [
            ListTile(leading: CircleAvatar(backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)), title: Text('Alex Rivera'), trailing: Text('6 | 4 | 2')),
            Divider(),
            ListTile(leading: CircleAvatar(backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)), title: Text('Sarah Chen'), trailing: Text('4 | 6 | 1')),
          ]),
        ),
      ],
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoCard({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
      child: Row(children: [Icon(icon, color: Colors.black54), const SizedBox(width: 8), Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(color: Colors.black54)), const SizedBox(height: 6), Text(value, style: const TextStyle(fontWeight: FontWeight.w800))])]),
    );
  }
}

class _RuleRow extends StatelessWidget {
  final String number;
  final String text;
  const _RuleRow({required this.number, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(12)), child: Text(number, style: const TextStyle(fontWeight: FontWeight.w800))),
        const SizedBox(width: 12),
        Expanded(child: Text(text)),
      ],
    );
  }
}
