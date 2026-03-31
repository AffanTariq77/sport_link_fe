import 'package:flutter/material.dart';
import '../widgets/common_header.dart';

class MessagesListScreen extends StatelessWidget {
  const MessagesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: const CommonHeader(title: 'Messages'),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: const TextField(
                  decoration: InputDecoration(border: InputBorder.none, prefixIcon: Icon(Icons.search), hintText: 'Search athletes or coaches...'),
                ),
              ),

              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('ACTIVE MATCHES', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.black54)),
                  Text('VIEW ALL', style: TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 76,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: const [
                    SizedBox(width: 4),
                    _ActiveAvatar(name: 'Marcus'),
                    SizedBox(width: 12),
                    _ActiveAvatar(name: 'Sarah'),
                    SizedBox(width: 12),
                    _ActiveAvatar(name: 'Find', placeholder: true),
                  ],
                ),
              ),

              const SizedBox(height: 18),
              const Text('RECENT CHATS', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.black54)),
              const SizedBox(height: 12),
              Column(
                children: [
                  _chatItem(context, 'Elena Rodriquez', 'See you at the court! Don\'t forget t...', '10:42 AM', tag: 'COACH', sport: 'Tennis'),
                  const SizedBox(height: 10),
                  _chatItem(context, 'David Chen', 'That was a great match yesterday. R...', 'Yesterday'),
                  const SizedBox(height: 10),
                  _chatItem(context, 'Morning Run Crew', 'Marcus: I\'ll be there at 6am sharp...', 'Tue'),
                  const SizedBox(height: 10),
                  _chatItem(context, 'Maya Singh', 'The yoga studio has a new opening ...', 'Mon'),
                ],
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: const Color(0xFFEA5B2C),
        child: const Icon(Icons.edit),
      ),
    );
  }

  Widget _chatItem(BuildContext context, String name, String preview, String time, {String? tag, String? sport}) {
    return GestureDetector(
      onTap: () => Navigator.of(context).pushNamed('/chat', arguments: {'name': name}),
      child: Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              const CircleAvatar(radius: 22, backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w800))),
                        Text(time, style: const TextStyle(color: Colors.black45, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (tag != null)
                          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(8)), child: Text(tag, style: const TextStyle(fontSize: 11, color: Colors.green))),
                        if (sport != null) ...[const SizedBox(width: 8), Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(8)), child: Text(sport, style: const TextStyle(fontSize: 11, color: Colors.black54)))],
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(preview, style: const TextStyle(color: Colors.black54)),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class _ActiveAvatar extends StatelessWidget {
  final String name;
  final bool placeholder;
  const _ActiveAvatar({required this.name, this.placeholder = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(color: placeholder ? Colors.white : Colors.green[400], shape: BoxShape.circle, border: Border.all(color: Colors.black12)),
          child: placeholder ? const Center(child: Icon(Icons.add, color: Colors.black26)) : const Center(child: Icon(Icons.person, color: Colors.white)),
        ),
        const SizedBox(height: 6),
        Text(name, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
