**Подготовка системы (Arch)**

sudo pacman -Syu
sudo pacman -S git docker docker-compose dotnet-sdk aspnet-runtime nodejs npm

yay -S waydroid
sudo waydroid init
sudo systemctl enable --now waydroid-container

sudo systemctl start docker.service
sudo usermod -aG docker $USER
reboot

**Порядок запуска**

cd Civio
cp .env.example .env

docker compose up -d
docker ps
docker exec -it civio-system-postgres psql -U civio_user -d civio_system -c "\dt"

dotnet restore
dotnet build
dotnet run --project src/Civio.Api/Civio.Api.csproj
http://localhost:5214/swagger

cd Civio/clients/Civio.Web
npm install
cp .env.example .env
npm run dev
http://localhost:5173

waydroid session start
waydroid show-full-ui
wayland status
adb connect 192.168.240.100:5555
adb logcat --clear && adb logcat | grep -E "E/|FATAL|AndroidRuntime"
cd Civio/clients/Civio.Mobile
./gradlew assembleDebug --warning-mode all
adb install app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:5214 tcp:5214

**Данные для входа:**
  owner@civio.test      / Test1234!  — owns org1 (approved) + org2 (approved)
  employee@civio.test   / Test1234!  — works in org1 (emp1)
  client@civio.test     / Test1234!  — citizen with bookings (created, confirmed, cancelled)
  admin@civio.test      / Test1234!  — PlatformAdmin
  owner2@civio.test     / Test1234!  — owns org3 (pending moderation)
  owner3@civio.test     / Test1234!  — owns org4 (rejected)
  owner4@civio.test     / Test1234!  — owns org5 (blocked)
  employee2@civio.test  / Test1234!  — no employee link (free citizen, OrganizationEmployee role)
  employee3@civio.test  / Test1234!  — works in org2 (emp3)
  client2@civio.test    / Test1234!  — citizen with completed + rejected bookings
  client3@civio.test    / Test1234!  — clean citizen (no bookings)
