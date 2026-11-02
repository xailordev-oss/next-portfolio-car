import CarNav from "@/components/CarNav";
import CarSection from "@/components/CarSection";
import { cars, developer } from "@/data/cars";

export default function Home() {
  return (
    <>
      <CarNav />
      <main>
        {/* One full-screen section per car */}
        {cars.map((car) => (
          <CarSection key={car.id} car={car} />
        ))}
      </main>

      {/* The close: who built this, and what the models and numbers are */}
      <footer className="snap-end border-t border-line px-4 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_minmax(0,24rem)] md:items-end">
          <div>
            <p className="text-[clamp(2rem,5vw,3.75rem)] font-light leading-[1.05] tracking-[-0.03em]">{developer.name}</p>
            <p className="mt-2 text-muted">{developer.role}</p>
            <a
              href={developer.url}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              {developer.linkLabel}
            </a>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted">
            ໂມເດລເປັນ low-poly ຕາມປະເພດຕົວຖັງ ບໍ່ແມ່ນຮູບຮ່າງຈິງຂອງແຕ່ລະຮຸ່ນ. ຊື່ສີຕັ້ງຂຶ້ນສຳລັບເວັບນີ້.
            ສະເປັກເປັນຄ່າອ້າງອີງຈາກສື່ລົດ ແລະ ຂຶ້ນກັບປີລຸ້ນ ແລະ ອຸປະກອນ: M4 ຄວາມໄວ 290 km/h ຕ້ອງມີ M Driver&rsquo;s
            Package, ຕົວເລກ F-150 Raptor ມາຈາກການທົດສອບຂອງ auto motor und sport. ເວັບນີ້ບໍ່ກ່ຽວຂ້ອງກັບຜູ້ຜະລິດລົດ.
          </p>
        </div>
      </footer>
    </>
  );
}
