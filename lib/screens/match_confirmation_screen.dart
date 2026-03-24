import 'package:flutter/material.dart';

class MatchConfirmationScreen extends StatelessWidget {
  const MatchConfirmationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D1423),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              width: 360,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: const Color(0xFF131B2D),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF22314A)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                      color: const Color(0x222ECC71),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0x552ECC71)),
                    ),
                    child: const Icon(Icons.check_circle, color: Color(0xFF2ECC71), size: 40),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Match Confirmed!',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 24),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'You have successfully joined the match.\nGet ready to play!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF8FA0BF), height: 1.35),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A2438),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('FOOTBALL', style: TextStyle(color: Color(0xFF2FA4FF), fontSize: 11, fontWeight: FontWeight.w700)),
                        SizedBox(height: 4),
                        Text('Evening Scrimmage', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
                        SizedBox(height: 4),
                        Text('Friday, Oct 24 • 18:00 - 20:00', style: TextStyle(color: Color(0xFF8FA0BF), fontSize: 12)),
                        SizedBox(height: 3),
                        Text('Downtown Sports Complex', style: TextStyle(color: Color(0xFF8FA0BF), fontSize: 12)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF304058)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.calendar_today_outlined, color: Colors.white70, size: 16),
                      label: const Text('Add to Calendar', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: const LinearGradient(colors: [Color(0xFF1F78FF), Color(0xFF2FA4FF)]),
                      ),
                      child: ElevatedButton.icon(
                        onPressed: () => Navigator.of(context).popUntil((r) => r.isFirst),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.share_outlined, color: Colors.white),
                        label: const Text('Share with Friends', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
