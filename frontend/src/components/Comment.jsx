import {useAuth} from "../contexts/AuthContext.jsx";
import styles from "../styles/WeMoveShared.module.css";
import {useEffect, useState} from "react";
import {createComment, getComments} from "../api/commentApi.js";
export default function Comment({meetingId, hostUserId}){
    const { user,isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");

    //1.댓글목록조회
    const fetchComments = ()=>{
        getComments(meetingId).then((res)=>{
            console.log(res)
            setComments(res.data);
        }).catch((err)=>{
            console.error("댓글불러오기 실패: ",err);
        })
    }
    useEffect(()=>{
        if(meetingId){
            fetchComments();
        }
    },[meetingId]);

    //2.댓글 등록
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if(!content.trim()){
            alert("댓글 내용을 입력해주세요.");
            return;
        }
        createComment(meetingId, {content}).then(res=>{
            console.log(res);
            setContent(""); // 입력창 초기화
            fetchComments(); //목록새로고침
        }).catch((err)=>{
            console.log(err);
            alert("댓글 등록에 실패했습니다.")
        })
    }




    return(
        <>
            <div className={styles.commentList}>

                {comments.length === 0 ? (
                    <p>아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ):(
                    comments.map((comment)=>(
                        <article key={comment.commentId} className={styles.commentItem}>
                            <div className={styles.commentAvatar}/>
                                <div>
                                    <div className={styles.commentMeta}>
                                        <strong>{comment.nickname}</strong>
                                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                        </article>
                    )))}
            </div>
            {isAuthenticated ? (
                <form className={styles.commentForm}>
                    <textarea placeholder="모임장에게 궁금한 점이나 참여 전에 확인하고 싶은 내용을 남겨보세요."/>
                    <div className={styles.formActions}>
                        <button
                            type="button"
                        >댓글 등록
                        </button>
                    </div>
                </form>
            ):(
                <p style={{ color: "#666", marginBottom: "20px" }}>댓글을 작성하려면 로그인이 필요합니다.</p>
            )}


        </>
    )
}