import 'package:flutter/material.dart';

class CommonHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBack;
  final bool showNotification;

  const CommonHeader({super.key, required this.title, this.showBack = false, this.showNotification = true});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppBar(
      automaticallyImplyLeading: false,
      backgroundColor: theme.appBarTheme.backgroundColor,
      elevation: theme.appBarTheme.elevation ?? 0,
      leading: showBack
          ? IconButton(
              onPressed: () => Navigator.of(context).maybePop(),
              icon: Icon(Icons.arrow_back, color: theme.colorScheme.primary),
              tooltip: 'Back',
            )
          : null,
      title: Text(title, style: theme.appBarTheme.titleTextStyle),
      actions: [
        if (showNotification)
          IconButton(
            onPressed: () => Navigator.of(context).pushNamed('/notifications'),
            icon: const Icon(Icons.notifications_none),
            tooltip: 'Notifications',
          ),
        Padding(
          padding: const EdgeInsets.only(right: 12.0),
          child: Semantics(
            label: 'Account',
            child: InkWell(
              borderRadius: BorderRadius.circular(48),
              onTap: () => Navigator.of(context).pushNamed('/profile'),
              child: CircleAvatar(
                backgroundColor: Colors.grey[200],
                radius: 18,
                child: ClipOval(
                  child: Image.asset(
                    'assets/images/avatar.png',
                    width: 36,
                    height: 36,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.person, color: Colors.black54),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
