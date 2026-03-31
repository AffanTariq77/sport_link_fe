import 'package:flutter/material.dart';
import '../utils/responsive.dart';
import '../widgets/common_header.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: const CommonHeader(title: 'SportLink'),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: context.pagePadding().copyWith(bottom: 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0,6))]),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: Colors.grey[200],
                      child: ClipOval(
                        child: Image.asset(
                          'assets/images/profile_avatar.png',
                          width: 72,
                          height: 72,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Icon(Icons.person, color: Colors.white, size: 36),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text('Alex Morgan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 6),
                    const Text('Pro Tier', style: TextStyle(color: Colors.black54)),
                    const SizedBox(height: 12),
                    ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA5B2C), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24))), child: const Text('Edit Profile'))
                  ],
                ),
              ),

              const SizedBox(height: 18),
              Row(children: [
                Expanded(child: _statCard('Total Matches', '97')),
                const SizedBox(width: 12),
                Expanded(child: _statCard('Win Record', '85')),
              ]),
              const SizedBox(height: 12),
              _statCard('Loss Record', '12', fullWidth: true),

              const SizedBox(height: 18),
              const Text('Active Sports', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Wrap(spacing: 8, children: [
                _sportChip('Tennis', 'Expert (4.8)'),
                _sportChip('Padel', 'Advanced (4.2)'),
                _sportChip('Badminton', 'Intermediate (3.5)'),
              ]),

              const SizedBox(height: 18),
              const Text('Achievements', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              Row(children: [Expanded(child: _achievementCard('Tournament Winner', 'Elite Summer Cup \n\'23')), const SizedBox(width: 8), Expanded(child: _achievementCard('Most Active', '30 Matches this month'))]),

              const SizedBox(height: 18),
              const Text('Recent Matches', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              Column(children: [
                _recentMatch('vs. David Chen', 'Yesterday • Green Valley Arena', 'WIN', '6-4, 7-5'),
                const SizedBox(height: 8),
                _recentMatch('vs. Sarah Jenkins', '3 days ago • Padel Pro Club', 'LOSS', '4-6, 3-6'),
                const SizedBox(height: 8),
                _recentMatch('vs. Marcus Thorne', 'Last Sunday • Central Court', 'WIN', '6-2, 6-8'),
              ]),

              const SizedBox(height: 24),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Column(children: [
                  ListTile(title: const Text('Notifications'), trailing: const Icon(Icons.chevron_right), onTap: () => Navigator.of(context).pushNamed('/notifications')),
                  const Divider(height: 1),
                  ListTile(title: const Text('Payments & Subscriptions'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
                  const Divider(height: 1),
                  ListTile(title: const Text('Preferences'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
                ]),
              ),

              const SizedBox(height: 24),
              Center(child: TextButton(onPressed: () {}, child: const Text('Log Out', style: TextStyle(color: Colors.red)))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statCard(String title, String value, {bool fullWidth = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      width: fullWidth ? double.infinity : null,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(color: Colors.black54)), const SizedBox(height: 8), Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900))]),
    );
  }

  Widget _sportChip(String name, String subtitle) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)), child: Column(children: [Text(name, style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 4), Text(subtitle, style: const TextStyle(color: Colors.black54, fontSize: 11))]));
  }

  Widget _achievementCard(String title, String subtitle) {
    return Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 6), Text(subtitle, style: const TextStyle(color: Colors.black54))]));
  }

  Widget _recentMatch(String title, String subtitle, String result, String score) {
    final isWin = result == 'WIN';
    return Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]), child: Row(children: [const CircleAvatar(radius: 20, backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 6), Text(subtitle, style: const TextStyle(color: Colors.black54))])), Column(children: [Text(result, style: TextStyle(color: isWin ? Colors.green : Colors.red, fontWeight: FontWeight.w800)), const SizedBox(height: 6), Text(score, style: const TextStyle(color: Colors.black54))]) ]));
  }
}
