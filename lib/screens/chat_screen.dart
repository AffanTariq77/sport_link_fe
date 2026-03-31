import 'package:flutter/material.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
    final name = args != null && args['name'] != null ? args['name'] as String : 'Chat';

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Color(0xFF0F8A66)), onPressed: () => Navigator.of(context).pop()),
        title: Row(
          children: [
            const CircleAvatar(radius: 18, backgroundColor: Colors.black12, child: Icon(Icons.person, color: Colors.white)),
            const SizedBox(width: 10),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(name, style: const TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w800)), const Text('PRO TIER PLAYER', style: TextStyle(fontSize: 11, color: Colors.black45))])
          ],
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.videocam, color: Colors.black54)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.call, color: Colors.black54)),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  const SizedBox(height: 6),
                  Align(alignment: Alignment.center, child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(12)), child: const Text('TODAY', style: TextStyle(color: Colors.black54)))),
                  const SizedBox(height: 12),
                  _incomingBubble('Hey! I saw you\'re looking for a hitting partner for Padel this weekend. Still available?', time: '10:15 AM'),
                  const SizedBox(height: 10),
                  _outgoingBubble('Definitely! I\'ve been looking to test out the new courts at the Oasis Sports Center. Does Saturday work for you?', time: '10:18 AM'),
                  const SizedBox(height: 12),
                  // booking card
                  _bookingCard(context),
                  const SizedBox(height: 12),
                  _outgoingBubble('Looks perfect! Just accepted the split. See you on court 4', time: '10:22 AM'),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              color: Colors.white,
              child: Row(
                children: [
                  IconButton(onPressed: () {}, icon: const Icon(Icons.add_circle_outline, color: Colors.black54)),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(30)),
                      child: const TextField(decoration: InputDecoration(border: InputBorder.none, hintText: 'Type your message...')),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FloatingActionButton(onPressed: () {}, mini: true, backgroundColor: const Color(0xFF0F8A66), child: const Icon(Icons.send, size: 18)),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _incomingBubble(String text, {required String time}) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 320),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(text), const SizedBox(height: 8), Text(time, style: const TextStyle(fontSize: 11, color: Colors.black45))]),
      ),
    );
  }

  Widget _outgoingBubble(String text, {required String time}) {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 320),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFF0F8A66), borderRadius: BorderRadius.circular(16)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(text, style: const TextStyle(color: Colors.white)), const SizedBox(height: 8), Text(time, style: const TextStyle(fontSize: 11, color: Colors.white70))]),
      ),
    );
  }

  Widget _bookingCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0,6))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(borderRadius: const BorderRadius.vertical(top: Radius.circular(16)), child: Container(height: 140, color: Colors.blueGrey.shade200, child: const Center(child: Icon(Icons.photo, size: 56, color: Colors.white70)))),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('The Oasis Padel Club', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Row(children: const [Icon(Icons.calendar_today_outlined, size: 16), SizedBox(width: 8), Text('Sat, Oct 14  •  10:00 - 11:30')]),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: Text('50/50 Split Requested', style: TextStyle(color: Colors.black54))),
                    ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA5B2C), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text('Accept & Pay \$22.50'))
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
