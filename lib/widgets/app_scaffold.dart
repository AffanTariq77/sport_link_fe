import 'package:flutter/material.dart';
import '../widgets/common_header.dart';

class AppScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final bool showBack;
  final bool showNotification;

  const AppScaffold({super.key, required this.title, required this.body, this.showBack = false, this.showNotification = true});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CommonHeader(title: title, showBack: showBack, showNotification: showNotification),
      body: SafeArea(child: body),
    );
  }
}
