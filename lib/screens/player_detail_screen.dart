import 'package:flutter/material.dart';
import '../widgets/common_header.dart';

class PlayerDetailScreen extends StatelessWidget {
  const PlayerDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final name = args?['name'] as String? ?? 'Player';

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: const CommonHeader(title: 'SportLink', showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              Center(child: CircleAvatar(radius: 48, backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white, size: 48))),
              const SizedBox(height: 12),
              Center(child: Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900))),
              const SizedBox(height: 6),
              Center(child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(20)), child: const Text('PRO PLAYER', style: TextStyle(color: Colors.blue)))) ,
              const SizedBox(height: 12),
              const Text('Passionate tennis player with 10+ years experience. Always looking for competitive matches and good vibes on the court.', style: TextStyle(color: Colors.black54)),
              const SizedBox(height: 18),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                _statCard('142', 'Matches'),
                _statCard('88%', 'Win Rate'),
                _statCard('4.9', 'Rating'),
              ]),
              const SizedBox(height: 18),
              const Text('Favorite Sports', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Wrap(spacing: 8, children: [
                _tag('Tennis'),
                _tag('Pickleball'),
                _tag('Hiking'),
              ]),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.of(context).pushNamed('/chat', arguments: {'name': name}),
                  icon: const Icon(Icons.chat_bubble_outline),
                  label: const Text('Chat with Player'),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F8A66), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))),
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: IconButton(onPressed: () {}, icon: const Icon(Icons.favorite_border, color: Colors.black54)),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _statCard(String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
        child: Column(children: [Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)), const SizedBox(height: 6), Text(label, style: const TextStyle(color: Colors.black54))]),
      ),
    );
  }

  Widget _tag(String label) => Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)), child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)));
}
