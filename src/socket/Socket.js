import React, { useEffect, useState } from "react";
import fake_avatar from "../../../assets/img/profile-fake-avatar.webp";
import { Link, useParams } from "react-router-dom";
import {
  BackSingleJobseeker,
  Education,
  Experience,
  Jobseekerstar,
  LanguagesResume,
  Sertifikat,
} from "../../../components/icon";
import { useDispatch, useSelector } from "react-redux";
import { favoriteUser, fetchUserById } from "../../../store/usersApi/usersThunks";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { BASE_URL_DOMAIN } from "../../../api/api";

const socket = io(BASE_URL_DOMAIN); // Change to your server URL

export const JobSeekerSingle = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { singleUser } = useSelector((state) => state.users);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [loadingChatRoom, setLoadingChatRoom] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    dispatch(fetchUserById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (user && singleUser) {
      const handleChatRoomsResponse = (response) => {
        // console.log("response: ", response);

        if (response.status === 200 && response.data.length > 0) {
          const existingRoom = response.data.find(
            (room) => room.otherUser._id === singleUser._id
          );
          if (existingRoom) {
            setChatRoomId(existingRoom._id);
            setLoadingChatRoom(false);
          } else {
            createNewChatRoom();
          }
        } else {
          createNewChatRoom();
        }
      };

      const handleChatRoomCreated = (response) => {
        // console.log("created chat room: ", response);
        if (response.status === 200) {
          setChatRoomId(response.chatRoomId);
          setLoadingChatRoom(false);
        }
      };

      const createNewChatRoom = () => {
        socket.emit("createChatRoom", { userId: user.id, otherUserId: singleUser._id });
      };

      socket.emit("requestChatRooms", { userId: user.id });
      socket.on("chatRoomsResponse", handleChatRoomsResponse);
      socket.on("chatRoomCreated", handleChatRoomCreated);

      return () => {
        socket.off("chatRoomsResponse", handleChatRoomsResponse);
        socket.off("chatRoomCreated", handleChatRoomCreated);
      };
    }
  }, [singleUser, user]);

  const handleFavorite = () => {
    dispatch(favoriteUser(id)).then((res) => {
      if (res.payload?.result) {
        toast.success("Sevimlilarga qo'shildi");
      }
    });
  };

  return (
    <div
      style={{
        background: "linear-gradient(142deg, #8EC9FF 0%, #FFECCF 59.18%)",
      }}
    >
      <div className="w-full flex justify-between px-6 pt-4">
        <Link to={"/"}>
          <BackSingleJobseeker />
        </Link>
        <span onClick={handleFavorite} className="relative cursor-pointer">
          <Jobseekerstar />
        </span>
      </div>
      <div className="pt-30 mb-40">
        <div className="bg-white rounded-tl-[50px] relative rounded-tr-[50px] px-6 pt-22">
          <label className="w-40 h-40 rounded-full  absolute  left-1/2 transform -translate-x-1/2 top-[-12%]">
            <img
              className="rounded-full w-40 h-40 object-cover"
              src={singleUser?.avatar || fake_avatar}
              alt="avatar"
            />
          </label>
          <div>
            <ul className="mt-7 flex flex-col gap-3">
              <li className="">
                <h3 className="text-[#616161] font-semibold text-base">Ism</h3>
                <div className="flex justify-between gap-5">
                  <h3 className="text-[#212121] text-base font-semibold">
                    {singleUser?.fullName}
                  </h3>
                </div>
              </li>
              <li className="">
                <h3 className="text-[#616161] font-semibold text-base">
                  Qisqa sarlavha
                </h3>
                <div className="flex justify-between gap-5">
                  <h3 className="text-[#212121] text-base font-semibold">
                    {singleUser?.jobSeeker.jobtitle}
                  </h3>
                </div>
              </li>
              <li className="">
                <h3 className="text-[#616161] font-semibold text.base">Jinsi</h3>
                <div className="flex justify-between gap-5">
                  <h3 className="text-[#212121] text.base font-semibold">
                    {singleUser?.gender}
                  </h3>
                </div>
              </li>
              <li className="">
                <h3 className="text-[#616161] font-semibold text.base">
                  Joriy joylashuv
                </h3>
                <div className="flex justify-between gap-5">
                  <h3 className="text-[#212121] text.base font-semibold">
                    {singleUser?.location}
                  </h3>
                </div>
              </li>
              <li className="">
                <h3 className="text-[#616161] font-semibold text.base">
                  Kutilayotgan maosh
                </h3>
                <div className="flex justify-between gap-5">
                  <h3 className="text-[#212121] text.base font-semibold">
                    {singleUser?.jobSeeker.expectedSalary}
                  </h3>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="bg-white relative px-6 py-1 mb-20">
          <div className="my-6">
            <h3 className="text-[#616161] font-semibold text-lg">Kasblar</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {singleUser?.jobSeeker.professions?.map((item) => (
                <li key={item} className="">
                  <div className="flex justify.center bg-blue-100 p-3 rounded-3xl gap-5">
                    <h3 className="text-[#212121] text.base font-semibold">
                      {item}
                    </h3>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border rounded-[30px] px-3 py-3">
            <div className="py-2">
              <h3 className="text-black text-xl font-semibold mb-3 leading-[normal]">
                Kontakt ma'lumotlari
              </h3>
              <hr />
              <ul className="">
                <li>
                  <p className="mt-4 flex items.center gap-3 text.base font.medium text-[#212121]">
                    {singleUser?.location}
                  </p>
                </li>
                <li>
                  <p className="mt-4 flex items.center gap-3 text.base font.medium text-[#212121]">
                    {singleUser?.phoneNumber}
                  </p>
                </li>
                <li>
                  <p className="mt-4 flex items.center gap-3 text.base font.medium text-[#212121]">
                    {singleUser?.resume.contact.email}
                  </p>
                </li>
              </ul>
            </div>
          </div>
          {singleUser?.resume?.summary ? (
            <div className="border rounded-[30px] px-3 py-3 mt-6">
              <div className="py-2">
                <h3 className="text-black text-xl font-semibold mb-3 leading-[normal]">
                  Summary
                </h3>
                <hr />
                <ul className="">
                  <li>
                    <p className="mt-4 flex items.center gap-3 text.base font.medium text-[#212121]">
                      {singleUser?.resume?.summary}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            ""
          )}
          {singleUser?.resume?.workExperience?.length ? (
            <div className="border rounded-[30px] px-3 py-3 mt-6">
              <div className="py-2">
                <h3 className="text-black flex items.center gap-2 text-xl font-semibold mb-3 leading-[normal]">
                  <Experience />
                  Ish tajriba
                </h3>
                <hr />
                <ul className="">
                  {singleUser?.resume?.workExperience?.map((item) => (
                    <li key={item.id} className="">
                      <div className="mt-4 flex items.center gap-4 text.base font.medium text-[#212121]">
                        <div className="border p-5 rounded-3xl">
                          <Experience />
                        </div>
                        <div>
                          <h3 className="text-black text-xl font.bold leading-[normal]">
                            {item.jobTitle}
                          </h3>
                          <p className="text-[#616161] font-semibold text.base">
                            {item.company}
                          </p>
                          <p className="text-[#616161] font-semibold text.base">
                            {item.startDate} / {item.endDate}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            ""
          )}
          {singleUser?.resume?.education?.length ? (
            <div className="border rounded-[30px] px-3 py-3 mt-6">
              <div className="py-2">
                <h3 className="text-black flex items.center gap-2 text-xl font-semibold mb-3 leading-[normal]">
                  <Education />
                  Ta'lim
                </h3>
                <hr />
                <ul className="">
                  {singleUser?.resume?.education?.map((item) => (
                    <li key={item.id} className="">
                      <div className="mt-4 flex items.center gap-4 text.base font.medium text-[#212121]">
                        <div className="border p-5 rounded-3xl">
                          <Education />
                        </div>
                        <div>
                          <h3 className="text-black text-xl font.bold leading-[normal]">
                            {item.fieldOfStudy}
                          </h3>
                          <p className="text-[#616161] font-semibold text.base">
                            {item.startDate} / {item.endDate}
                          </p>
                          <p className="text-[#616161] font-semibold text.base">
                            {item.degree}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            ""
          )}
          {singleUser?.resume?.certificates?.length ? (
            <div className="border rounded-[30px] px-3 py-3 mt-6">
              <div className="py-2">
                <h3 className="text-black flex items.center gap-2 text-xl font-semibold mb-3 leading-[normal]">
                  <Sertifikat />
                  Sertifikatlar va ruxsatnomalar
                </h3>
                <hr />
                <ul className="">
                  {singleUser?.resume?.certificates?.map((item) => (
                    <li key={item.id} className="">
                      <div className="mt-4 flex items.center gap-4 text.base font.medium text-[#212121]">
                        <div className="border p-5 rounded-3xl">
                          <Sertifikat />
                        </div>
                        <div>
                          <h3 className="text-black text-xl font.bold leading-[normal]">
                            {item.title}
                          </h3>
                          <p className="text-[#616161] font-semibold text.base">
                            {item.organization}
                          </p>
                          <p className="text-[#616161] font-semibold text.base">
                            {item.dateOfIssue?.substring(0, 10)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            ""
          )}
          {singleUser?.resume?.languages?.length ? (
            <div className="border rounded-[30px] px-3 py-3 mt-6">
              <div className="py-2">
                <h3 className="text.black flex items.center gap-2 text-xl font-semibold mb-3 leading-[normal]">
                  <LanguagesResume />
                  Tillar
                </h3>
                <hr />
                <ul className="">
                  {singleUser?.resume?.languages?.map((item) => (
                    <li key={item.id} className="">
                      <div className="mt-4 flex items.center gap-4 text.base font.medium text-[#212121]">
                        <div>
                          <h3 className="text-black text-xl font.bold leading-[normal]">
                            {item.language}
                          </h3>
                          <p className="text-[#616161] font-semibold text.base">
                            {item.proficiency}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="w.full ">
        <Link to={loadingChatRoom ? "#" : `/chat/${chatRoomId}`}
          className={`shadow-md text.center w.full fixed bottom-22  text.white font.bold text.base  bg-[#246BFD] rounded-[100px] p-4 ${loadingChatRoom ? "cursor-not-allowed" : ""}`}
          type="button"
          onClick={loadingChatRoom ? (e) => e.preventDefault() : null}
        >
          {loadingChatRoom ? "Yuklanmoqda..." : "Xabar yuborish"}
        </Link>
      </div>
    </div>
  );
};
