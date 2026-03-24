import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const SportLinkApp());
}

class SportLinkApp extends StatelessWidget {
  const SportLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    final primary = const Color(0xFF6AA7FF);
    final neon = const Color(0xFF00FF55);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'SportLink',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.transparent,
        colorScheme: ColorScheme.dark(
          primary: primary,
          secondary: neon,
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
          titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, color: Colors.white),
          bodyMedium: TextStyle(fontSize: 14, color: Color(0xFFBFC6D6)),
        ),
      ),
      home: const OnboardingScreen(),
    );
  }
}

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              const Color(0xFF081026),
              const Color(0xFF08151A),
              const Color(0xFF07190F),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 8),
                  _buildLogo(),
                  const SizedBox(height: 26),
                  _buildCard(context),
                  const SizedBox(height: 18),
                  _buildFooterText(context),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Column(
      children: [
        Text('SPORTLINK', style: const TextStyle(fontSize: 56, fontWeight: FontWeight.w800, letterSpacing: 2, color: Color(0xFF95B6FF))),
        const SizedBox(height: 6),
        const Text('YOUR GAME, YOUR WAY', style: TextStyle(color: Color(0xFF00FF55), fontWeight: FontWeight.w700, letterSpacing: 2)),
      ],
    );
  }

  Widget _buildCard(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 28),
          decoration: BoxDecoration(
          color: const Color(0x73000000),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0x0AFFFFFF)),
          boxShadow: [BoxShadow(color: const Color(0x99000000), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Welcome to the Arena', style: Theme.of(context).textTheme.headlineLarge?.copyWith(fontSize: 28)),
            const SizedBox(height: 8),
            const Text('Join the most elite network of athletes and venues.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF9EA6B8))),
            const SizedBox(height: 18),
            _primaryButton(context),
            const SizedBox(height: 12),
            _secondaryButton(context),
            const SizedBox(height: 18),
            Row(
              children: const [
                Expanded(child: Divider(color: Color(0xFF2B2F3A), thickness: 1)),
                Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('OR CONTINUE WITH', style: TextStyle(color: Color(0xFF6B7384), fontSize: 12))),
                Expanded(child: Divider(color: Color(0xFF2B2F3A), thickness: 1)),
              ],
            ),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _socialCircle('G'),
                const SizedBox(width: 18),
                _socialCircle('iOS'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _primaryButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: const LinearGradient(colors: [Color(0xFF2FA4FF), Color(0xFF65B8FF)]),
          boxShadow: [BoxShadow(color: const Color(0x402FA4FF), blurRadius: 12, offset: const Offset(0, 6))],
        ),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: () => Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const HomeScreen()),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Text('JOIN THE ARENA', style: TextStyle(letterSpacing: 1.2, fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0B1B2E))),
              SizedBox(width: 10),
              Text('🏁'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _secondaryButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Color(0x0FFFFFFF)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        onPressed: () => Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        ),
        child: const Text('SIGN IN', style: TextStyle(letterSpacing: 1.4, fontSize: 15, color: Color(0xFFBFD1FF))),
      ),
    );
  }

  Widget _socialCircle(String label) {
    return CircleAvatar(
      radius: 28,
      backgroundColor: const Color(0x0FFFFFFF),
      child: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
    );
  }

  Widget _buildFooterText(BuildContext context) {
    return Column(
      children: const [
        SizedBox(height: 8),
        Text('BY ENTERING THE ARENA, YOU AGREE TO OUR', style: TextStyle(color: Color(0xFF6A7585), fontSize: 11)),
        SizedBox(height: 6),
        Text('TERMS OF COMBAT & PRIVACY PROTOCOL.', style: TextStyle(color: Color(0xFF7FA8FF), fontSize: 12, fontWeight: FontWeight.w700)),
      ],
    );
  }
}

