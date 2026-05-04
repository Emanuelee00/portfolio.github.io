// ╔══════════════════════════════════════════════════════════════════╗
// ║  EDIT THIS FILE to customize islands and projects.              ║
// ║  Each object in ISLANDS_CONFIG becomes a floating island.       ║
// ║  Add / remove entries in each island's `projects` array.        ║
// ║  Set `repo` to your exact GitHub repository name.               ║
// ╚══════════════════════════════════════════════════════════════════╝

export const GITHUB_USER = 'Emanuelee00';

export const ISLANDS_CONFIG = [

  // ── Island 1 · C Fundamentals ────────────────────────────────────────────
  {
    position:   [40, 0, 0],
    grassColor: 0x3a8a3a,
    hillColor:  0x2a6030,
    beachColor: 0xe8c87a,
    label: { en: 'C Fundamentals', it: 'Fondamenta C' },
    projects: [
      {
        name: 'libft',
        repo: 'libft',               // ← your GitHub repo name
        desc: {
          en: 'Reimplementation of the C standard library: ft_strlen, ft_memcpy, linked lists and more. The foundation of every 42 project.',
          it: 'Reimplementazione della libreria standard C: ft_strlen, ft_memcpy, liste concatenate e molto altro. La base di ogni progetto 42.',
        },
      },
      {
        name: 'push_swap',
        repo: 'push_swap',
        desc: {
          en: 'Sorting algorithm using two stacks and a limited set of operations. Goal: fewest possible moves.',
          it: 'Algoritmo di sorting con due stack e operazioni limitate. Obiettivo: il minor numero di mosse possibile.',
        },
      },
      {
        name: 'get_next_line',
        repo: 'get_next_line',
        desc: {
          en: 'Reads one line at a time from a file descriptor using a static buffer. Handles multiple fds simultaneously.',
          it: 'Legge una riga alla volta da un file descriptor usando un buffer statico. Gestisce più fd contemporaneamente.',
        },
      },
      {
        name: 'ft_printf',
        repo: 'ft_printf',
        desc: {
          en: 'Printf replica supporting %s %d %c %x %u %p and format flags. Outputs to arbitrary file descriptors.',
          it: 'Replica di printf con %s %d %c %x %u %p e flag di formattazione. Output su fd arbitrari.',
        },
      },
    ],
  },

  // ── Island 2 · Shell & Systems ───────────────────────────────────────────
  {
    position:   [12, 0, -44],
    grassColor: 0x2a7040,
    hillColor:  0x1a5030,
    beachColor: 0xd4b868,
    label: { en: 'Shell & Systems', it: 'Shell e Sistemi' },
    projects: [
      {
        name: 'minishell',
        repo: 'minishell',
        desc: {
          en: 'A bash-like shell with pipes, redirections, environment variables, signals, and built-in commands.',
          it: 'Una shell simile a bash con pipe, redirezioni, variabili d\'ambiente, segnali e comandi built-in.',
        },
      },
      {
        name: 'philosophers',
        repo: 'philosophers',
        desc: {
          en: 'The dining philosophers problem solved with threads and mutexes. No philosopher may starve.',
          it: 'Il problema dei filosofi a cena risolto con thread e mutex. Nessun filosofo deve morire di fame.',
        },
      },
    ],
  },

  // ── Island 3 · Graphics ──────────────────────────────────────────────────
  {
    position:   [-22, 0, -38],
    grassColor: 0x28806a,
    hillColor:  0x186050,
    beachColor: 0xdcc878,
    label: { en: 'Graphics', it: 'Grafica' },
    projects: [
      {
        name: 'fdf',
        repo: 'fdf',
        desc: {
          en: 'Wireframe 3D terrain renderer using MiniLibX. Reads elevation maps and projects them isometrically.',
          it: 'Renderer 3D wireframe di terreni con MiniLibX. Legge mappe di elevazione e le proietta isometricamente.',
        },
      },
      {
        name: 'so_long',
        repo: 'so_long',
        desc: {
          en: 'A small 2D game with map loading, collectibles, enemy movement, and sprite-based rendering.',
          it: 'Un piccolo gioco 2D con caricamento mappa, collezionabili, movimento nemici e rendering con sprite.',
        },
      },
    ],
  },

];
