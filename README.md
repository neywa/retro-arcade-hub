# retro-arcade-hub

This is a sample app I'm using to test deployments on Kubernetes clusters. It's currently Work in Progress.

This example assumes you are:
- Using podman (can be replaced by docker)
- Having an account on quay.io (can be replaced by registry of your choice) and are logged in via podman 'podman login quay.io'
- Deploying on OpenShift 4 (can be deployed on any k8s platform, just substitute the oc command for the command of your choice) and are logged in 

1. Clone the repository
2. Build the tetris game image and push it into quay.io:
    - \# cd retro-arcade-hub/apps/game-tetris
    - \# podman build -t retro-arcade-game-tetris:1.0.0 .
    - \# podman tag retro-arcade-game-tetris:1.0.0 quay.io/<your-quay-username>/retro-arcade-game-tetris:1.0.0
    - \# podman push quay.io/<your-quay-username>/retro-arcade-game-tetris:1.0.0
3. Deploy the tetris game:
    - \# cd retro-arcade-hub/kubernetes/game-tetris
    - \# oc deploy -f .
4. Note the tetris game route url - Networking > Routes > retro-arcade-tetris-game-route
5. Update the retro-arcade-hub/apps/frontend/src/index.html file with the route (line 72)
6. Build the frontend image and push it into quay.io:
    - \# cd retro-arcade-hub/apps/frontend
    - \# podman build -t retro-arcade-hub-frontend:1.0.0 .
    - \# podman tag retro-arcade-hub-frontend:1.0.0 quay.io/<your-quay-username>/retro-arcade-hub-frontend:1.0.0
    - \# podman push quay.io/<your-quay-username>/retro-arcade-hub-frontend:1.0.0
7. Deploy the frontend:
    - \# cd retro-arcade-hub/kubernetes/frontend
    - \# oc deploy -f .
8. In the browser of your choice navigate to the frontend route url - Networking > Routes > retro-arcade-frontend-route
