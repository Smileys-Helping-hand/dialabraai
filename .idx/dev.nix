{ pkgs, ... }: {
  # To learn more about how to use Nix to configure your environment
  # see: https://developers.google.com/idx/guides/customize-idx-env

  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.firebase-tools
  ];

  # Sets environment variables in the workspace
  env = {
    NEXT_PUBLIC_FIREBASE_API_KEY = "AIzaSyDL7pjQ2QKOsiMASKa-Lta2BYnUOnnOJtk";
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "dialabraai-78714.firebaseapp.com";
    NEXT_PUBLIC_FIREBASE_PROJECT_ID = "dialabraai-78714";
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "dialabraai-78714.appspot.com";
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "102296308816";
    NEXT_PUBLIC_FIREBASE_APP_ID = "1:102296308816:web:2bd977d065cc40feb81555";
    GEMINI_API_KEY = "AIzaSyAYXhnUhF7zBnG_bQGq-ysjgOoGm8tzSJM";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];

    # Enable previews and define a preview for your web application
    previews = {
      enable = true;
      previews = {
        web = {
          # The command to start your development server
          command = ["sh" "-c" "cd dialabraai && npm run dev -- --port $PORT"];
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Install project dependencies
        npm-install = "cd dialabraai && npm install";
        # Open these files by default
        default.openFiles = [ ".idx/dev.nix" "README.md" "dialabraai/lib/firebase.js" ];
      };

      # Runs when the workspace is (re)started
      onStart = {
        # The dev server is started as part of the preview configuration,
        # so we don't need to start it here.
      };
    };
  };
}
