import 'package:flutter/material.dart';

class BookingSummaryScreen extends StatelessWidget {
  const BookingSummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final title = args?['title'] as String? ?? 'Booking';
    final subtitle = args?['subtitle'] as String? ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Summary'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF0F8A66),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)]),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Text(subtitle, style: const TextStyle(color: Colors.black54)),
                  const SizedBox(height: 12),
                  const Text('Slot: 09:00 AM • 1 hour'),
                  const SizedBox(height: 6),
                  const Text('Players: 4 • Court: Center Court'),
                  const SizedBox(height: 12),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [Text('Total', style: TextStyle(fontWeight: FontWeight.w800)), Text('£24', style: TextStyle(fontWeight: FontWeight.w800))])
                ]),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pushNamed('/payment_success'),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F8A66), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))),
                  child: const Text('Confirm & Pay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
