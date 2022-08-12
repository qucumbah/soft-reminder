-- CreateTable
CREATE TABLE "Reminder" (
    "id" STRING NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "enabled" BOOL NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);
