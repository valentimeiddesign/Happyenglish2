import imgGoGetterBookCover480X6001 from "figma:asset/e561dd757e33cb72fbe965a42129ed3d19fd3cfc.png";
import img1126797069W1280H64011267970691 from "figma:asset/56e77a3b339a4a016f253ec4065f1634c3184c46.png";
import imgGoGetter3StudentSBookWithMyenglishlab924668800X8001 from "figma:asset/7f5c8f901f861de705ce49e1cb0375f7f09e0563.png";
import imgFormindsA2Studentsbook1 from "figma:asset/5c1cc67880730c149df98f560b5030a5e9c43dcb.png";

export default function Frame() {
  return (
    <div className="content-stretch flex gap-[66px] items-center relative size-full">
      <div className="h-[600px] relative shrink-0 w-[480px]" data-name="go-getter-book-cover-480x600 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgGoGetterBookCover480X6001} />
      </div>
      <div className="h-[598px] relative shrink-0 w-[422px]" data-name="1126797069_w1280_h640_1126797069 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={img1126797069W1280H64011267970691} />
      </div>
      <div className="h-[598px] relative shrink-0 w-[421px]" data-name="go-getter-3-student-s-book-with-myenglishlab-924668.800x800 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgGoGetter3StudentSBookWithMyenglishlab924668800X8001} />
      </div>
      <div className="h-[600px] relative shrink-0 w-[426px]" data-name="forminds_a2_studentsbook 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgFormindsA2Studentsbook1} />
      </div>
    </div>
  );
}