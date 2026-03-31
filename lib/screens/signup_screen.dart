import 'package:flutter/material.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _passwordCtrl = TextEditingController();
  final TextEditingController _confirmCtrl = TextEditingController();

  final List<String> _sports = ['Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball'];
  final Set<String> _selectedSports = {};
  int _skillIndex = 1; // 0: Beginner, 1: Intermediate, 2: Pro

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  void _toggleSport(String sport) {
    setState(() {
      if (_selectedSports.contains(sport)) {
        _selectedSports.remove(sport);
      } else {
        _selectedSports.add(sport);
      }
    });
  }

  void _createAccount() {
    // Basic validation (expand as needed)
    if (_nameCtrl.text.isEmpty || _emailCtrl.text.isEmpty || _passwordCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please complete required fields')));
      return;
    }
    if (_passwordCtrl.text != _confirmCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Passwords do not match')));
      return;
    }

    Navigator.of(context).pushReplacementNamed('/home');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.arrow_back, color: Color(0xFF0F8A66)),
                  ),
                  const SizedBox(width: 4),
                  const Text('SportLink', style: TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w700, fontSize: 16)),
                  const Spacer(),
                  const CircleAvatar(radius: 14, backgroundColor: Colors.black12, child: Icon(Icons.person, size: 18)),
                ],
              ),

              const SizedBox(height: 18),
              const Text('Join the Community', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              const Text('Create your profile to start playing', style: TextStyle(color: Colors.black54)),

              const SizedBox(height: 18),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 12, offset: const Offset(0, 6))],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildField(controller: _nameCtrl, label: 'FULL NAME', hint: 'Alex Morgan', icon: Icons.person),
                    const SizedBox(height: 12),
                    _buildField(controller: _emailCtrl, label: 'EMAIL OR PHONE', hint: 'alex.m@example.com', icon: Icons.alternate_email),
                    const SizedBox(height: 12),
                    _buildField(controller: _passwordCtrl, label: 'PASSWORD', hint: '••••••••', icon: Icons.lock, obscure: true),
                    const SizedBox(height: 12),
                    _buildField(controller: _confirmCtrl, label: 'CONFIRM PASSWORD', hint: '••••••••', icon: Icons.shield, obscure: true),
                  ],
                ),
              ),

              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Select Your Sports', style: TextStyle(fontWeight: FontWeight.w700)),
                  Text('Multi-select', style: TextStyle(color: Colors.black54, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 8,
                children: _sports.map((s) {
                  final selected = _selectedSports.contains(s);
                  return ChoiceChip(
                    label: Text(s, style: TextStyle(color: selected ? Colors.white : Colors.black87)),
                    selected: selected,
                    onSelected: (_) => _toggleSport(s),
                    selectedColor: const Color(0xFF0F8A66),
                    backgroundColor: Colors.grey[100],
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  );
                }).toList(),
              ),

              const SizedBox(height: 18),
              const Text('Your Skill Level', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              Row(
                children: List.generate(3, (i) {
                  final labels = ['BEGINNER', 'INTERMEDIATE', 'PRO'];
                  final selected = _skillIndex == i;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _skillIndex = i),
                      child: Container(
                        margin: EdgeInsets.only(left: i == 0 ? 0 : 10),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: selected ? Colors.white : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: selected ? const Color(0xFF0F8A66) : Colors.black12, width: selected ? 2 : 1),
                          boxShadow: selected ? [BoxShadow(color: Colors.black12, blurRadius: 6, offset: const Offset(0,4))] : null,
                        ),
                        child: Column(
                          children: [
                            Icon(i == 0 ? Icons.star_border : i == 1 ? Icons.star : Icons.emoji_events, color: selected ? const Color(0xFF0F8A66) : Colors.black26),
                            const SizedBox(height: 6),
                            Text(labels[i], style: TextStyle(fontWeight: FontWeight.w700, color: selected ? const Color(0xFF0F8A66) : Colors.black54)),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),

              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _createAccount,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEA5B2C),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                  ),
                  child: const Text('CREATE ACCOUNT', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ),

              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Already have an account? ', style: TextStyle(color: Colors.black54)),
                  GestureDetector(
                    onTap: () => Navigator.of(context).pushReplacementNamed('/login'),
                    child: Text('Login', style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.w700)),
                  )
                ],
              ),
              const SizedBox(height: 18),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField({required TextEditingController controller, required String label, required String hint, required IconData icon, bool obscure = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscure,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.grey[100],
            prefixIcon: Icon(icon, color: Colors.black26),
            contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }
}
