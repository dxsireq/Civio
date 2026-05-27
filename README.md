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
