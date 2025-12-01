export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function getThemePreference() {
              try {
                const stored = localStorage.getItem('theme-storage');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (parsed.state?.theme) {
                    return parsed.state.theme;
                  }
                }
              } catch (e) {
                // Ignore errors
              }
              return 'system';
            }
            
            function applyTheme(theme) {
              const root = document.documentElement;
              root.classList.remove('light', 'dark');
              
              if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light';
                root.classList.add(systemTheme);
              } else {
                root.classList.add(theme);
              }
            }
            
            const theme = getThemePreference();
            applyTheme(theme);
          })();
        `,
      }}
    />
  )
}

